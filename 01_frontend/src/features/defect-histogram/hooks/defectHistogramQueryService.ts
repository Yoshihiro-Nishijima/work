import {
	BackendDefectHistogramProvider,
	type DefectHistogramProvider,
} from "../providers/DefectHistogramProvider";
import type {
	DefectHistogramRangeRequest,
	DefectHistogramRangeResponse,
	DefectHistogramRequest,
	DefectHistogramResponse,
} from "../types";

type PendingRange = {
	controller: AbortController;
	promise: Promise<DefectHistogramRangeResponse>;
};

const rangeKey = (request: DefectHistogramRangeRequest): string =>
	`${request.field}|${JSON.stringify(request.filter ?? null)}|${request.lower}|${request.upper}`;

export class DefectHistogramQueryService {
	private readonly histogramRequests = new Map<string, AbortController>();
	private readonly rangeRequests = new Map<string, Map<string, PendingRange>>();
	private readonly rangeCache = new Map<
		string,
		{ key: string; result: DefectHistogramRangeResponse }
	>();
	private readonly rangeGeneration = new Map<string, number>();
	private readonly latestRangeKey = new Map<string, string>();
	private readonly rangeTimers = new Map<
		string,
		ReturnType<typeof setTimeout>
	>();

	constructor(
		private readonly provider: DefectHistogramProvider = new BackendDefectHistogramProvider(),
	) {}

	async getHistogram(
		id: string,
		resultName: string,
		request: DefectHistogramRequest,
	): Promise<DefectHistogramResponse> {
		this.clearRangeState(id);
		this.histogramRequests.get(id)?.abort();
		const controller = new AbortController();
		this.histogramRequests.set(id, controller);
		try {
			return await this.provider.getHistogram(
				resultName,
				request,
				controller.signal,
			);
		} finally {
			if (this.histogramRequests.get(id) === controller) {
				this.histogramRequests.delete(id);
			}
		}
	}

	prepareRange(id: string, request: DefectHistogramRangeRequest): number {
		const generation = (this.rangeGeneration.get(id) ?? 0) + 1;
		this.rangeGeneration.set(id, generation);
		this.latestRangeKey.set(id, rangeKey(request));
		return generation;
	}

	isLatestRange(
		id: string,
		request: DefectHistogramRangeRequest,
		generation: number,
	): boolean {
		return (
			this.rangeGeneration.get(id) === generation &&
			this.latestRangeKey.get(id) === rangeKey(request)
		);
	}

	async getRange(
		id: string,
		resultName: string,
		request: DefectHistogramRangeRequest,
		generation: number,
	): Promise<DefectHistogramRangeResponse | undefined> {
		const key = rangeKey(request);
		const cached = this.rangeCache.get(id);
		if (cached?.key === key) {
			return this.isLatestRange(id, request, generation)
				? cached.result
				: undefined;
		}

		let pending = this.rangeRequests.get(id)?.get(key);
		if (pending == null) {
			const controller = new AbortController();
			const promise = this.provider
				.getRange(resultName, request, controller.signal)
				.finally(() => {
					const requests = this.rangeRequests.get(id);
					if (requests?.get(key)?.controller === controller) {
						requests.delete(key);
						if (requests.size === 0) this.rangeRequests.delete(id);
					}
				});
			pending = { controller, promise };
			const requests = this.rangeRequests.get(id) ?? new Map();
			requests.set(key, pending);
			this.rangeRequests.set(id, requests);
		}

		const result = await pending.promise;
		if (!this.isLatestRange(id, request, generation)) return undefined;
		this.rangeCache.set(id, { key, result });
		return result;
	}

	scheduleRange(id: string, callback: () => void, delay = 180): void {
		this.cancelScheduledRange(id);
		this.rangeTimers.set(
			id,
			setTimeout(() => {
				this.rangeTimers.delete(id);
				callback();
			}, delay),
		);
	}

	cancelScheduledRange(id: string): void {
		const timer = this.rangeTimers.get(id);
		if (timer != null) clearTimeout(timer);
		this.rangeTimers.delete(id);
	}

	cancelItem(id: string): void {
		this.cancelScheduledRange(id);
		this.histogramRequests.get(id)?.abort();
		this.histogramRequests.delete(id);
		this.clearRangeState(id);
	}

	private clearRangeState(id: string): void {
		this.rangeGeneration.set(id, (this.rangeGeneration.get(id) ?? 0) + 1);
		this.latestRangeKey.delete(id);
		this.rangeCache.delete(id);
		for (const request of this.rangeRequests.get(id)?.values() ?? []) {
			request.controller.abort();
		}
		this.rangeRequests.delete(id);
	}
}

export const defectHistogramQueryService = new DefectHistogramQueryService();
