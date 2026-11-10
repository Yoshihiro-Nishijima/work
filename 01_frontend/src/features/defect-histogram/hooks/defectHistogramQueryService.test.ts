import { describe, expect, it, vi } from "vitest";

import type {
	DefectHistogramRangeRequest,
	DefectHistogramRangeResponse,
} from "../types";
import { DefectHistogramQueryService } from "./defectHistogramQueryService";

const request = (lower: number): DefectHistogramRangeRequest => ({
	field: "width",
	lower,
	upper: 10,
});

const rangeResult = (selected: number): DefectHistogramRangeResponse => ({
	counts: { left: 1, selected, right: 2 },
	categories: [],
	matchedCount: selected + 3,
	numericValueCount: selected + 3,
});

const deferred = <T>() => {
	let resolve!: (value: T) => void;
	let reject!: (reason?: unknown) => void;
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
};

const createService = (
	getRange: (
		resultName: string,
		body: DefectHistogramRangeRequest,
		signal?: AbortSignal,
	) => Promise<DefectHistogramRangeResponse>,
) =>
	new DefectHistogramQueryService({
		getHistogram: vi.fn(),
		getRange: vi.fn(getRange),
	});

describe("DefectHistogramQueryService", () => {
	it("shares in-flight requests and caches the latest range response", async () => {
		const response = rangeResult(4);
		const getRange = vi.fn(async () => response);
		const service = createService(getRange);
		const range = request(2);
		const generation = service.prepareRange("item-1", range);

		const first = service.getRange("item-1", "result-1", range, generation);
		const second = service.getRange("item-1", "result-1", range, generation);

		await expect(first).resolves.toEqual(response);
		await expect(second).resolves.toEqual(response);
		expect(getRange).toHaveBeenCalledTimes(1);

		const cachedGeneration = service.prepareRange("item-1", range);
		await expect(
			service.getRange("item-1", "result-1", range, cachedGeneration),
		).resolves.toEqual(response);
		expect(getRange).toHaveBeenCalledTimes(1);
	});

	it("discards an old response when a newer range request is selected", async () => {
		const oldRequest = deferred<DefectHistogramRangeResponse>();
		const newRequest = deferred<DefectHistogramRangeResponse>();
		const getRange = vi
			.fn()
			.mockReturnValueOnce(oldRequest.promise)
			.mockReturnValueOnce(newRequest.promise);
		const service = createService(getRange);
		const oldRange = request(1);
		const oldGeneration = service.prepareRange("item-1", oldRange);
		const oldResponse = service.getRange(
			"item-1",
			"result-1",
			oldRange,
			oldGeneration,
		);
		const newRange = request(3);
		const newGeneration = service.prepareRange("item-1", newRange);
		const newResponse = service.getRange(
			"item-1",
			"result-1",
			newRange,
			newGeneration,
		);

		newRequest.resolve(rangeResult(5));
		oldRequest.resolve(rangeResult(1));

		await expect(newResponse).resolves.toEqual(rangeResult(5));
		await expect(oldResponse).resolves.toBeUndefined();
		expect(service.isLatestRange("item-1", newRange, newGeneration)).toBe(true);
	});

	it("aborts pending work when an item is removed", async () => {
		const getRange = vi.fn(
			(
				_resultName: string,
				_body: DefectHistogramRangeRequest,
				signal?: AbortSignal,
			) =>
				new Promise<DefectHistogramRangeResponse>((_resolve, reject) => {
					signal?.addEventListener("abort", () =>
						reject(new DOMException("Aborted", "AbortError")),
					);
				}),
		);
		const service = createService(getRange);
		const range = request(2);
		const generation = service.prepareRange("item-1", range);
		const response = service.getRange("item-1", "result-1", range, generation);

		service.cancelItem("item-1");

		await expect(response).rejects.toMatchObject({ name: "AbortError" });
		expect(service.isLatestRange("item-1", range, generation)).toBe(false);
	});

	it("debounces range changes per histogram item", () => {
		vi.useFakeTimers();
		const service = createService(vi.fn());
		const onFirstRange = vi.fn();
		const onLatestRange = vi.fn();

		service.scheduleRange("item-1", onFirstRange);
		service.scheduleRange("item-1", onLatestRange);
		vi.advanceTimersByTime(180);

		expect(onFirstRange).not.toHaveBeenCalled();
		expect(onLatestRange).toHaveBeenCalledOnce();
		vi.useRealTimers();
	});

	it("keeps range caches independent between histogram items", async () => {
		const getRange = vi.fn(
			async (_resultName: string, body: DefectHistogramRangeRequest) =>
				rangeResult(body.lower),
		);
		const service = createService(getRange);
		const firstRange = request(1);
		const secondRange = request(2);
		const firstGeneration = service.prepareRange("item-1", firstRange);
		const secondGeneration = service.prepareRange("item-2", secondRange);

		await expect(
			service.getRange("item-1", "result-1", firstRange, firstGeneration),
		).resolves.toEqual(rangeResult(1));
		await expect(
			service.getRange("item-2", "result-1", secondRange, secondGeneration),
		).resolves.toEqual(rangeResult(2));
		expect(getRange).toHaveBeenCalledTimes(2);

		const firstCacheGeneration = service.prepareRange("item-1", firstRange);
		await expect(
			service.getRange("item-1", "result-1", firstRange, firstCacheGeneration),
		).resolves.toEqual(rangeResult(1));
		expect(getRange).toHaveBeenCalledTimes(2);
	});

	it("does not cache failed range requests", async () => {
		const getRange = vi
			.fn()
			.mockRejectedValueOnce(new Error("network error"))
			.mockResolvedValueOnce(rangeResult(3));
		const service = createService(getRange);
		const range = request(3);
		const firstGeneration = service.prepareRange("item-1", range);

		await expect(
			service.getRange("item-1", "result-1", range, firstGeneration),
		).rejects.toThrow("network error");

		const retryGeneration = service.prepareRange("item-1", range);
		await expect(
			service.getRange("item-1", "result-1", range, retryGeneration),
		).resolves.toEqual(rangeResult(3));
		expect(getRange).toHaveBeenCalledTimes(2);
	});
});
