const decimalPlaces = (value: number): number => {
	const [coefficient = "", exponentText = "0"] = value.toString().split("e");
	const fractionLength = coefficient.split(".")[1]?.length ?? 0;
	return Math.min(12, Math.max(0, fractionLength - Number(exponentText)));
};

export const getHistogramStep = (minimum: number, maximum: number): number =>
	(maximum - minimum) / 500 || 1;

export const formatHistogramValue = (value: number, step: number): string =>
	value.toLocaleString("ja-JP", {
		maximumFractionDigits: decimalPlaces(step),
	});

export const snapHistogramInput = (
	input: string,
	minimum: number,
	maximum: number,
	step: number,
): number | undefined => {
	if (input.trim() === "") return undefined;
	const parsed = Number(input);
	if (!Number.isFinite(parsed)) return undefined;
	const clamped = Math.min(maximum, Math.max(minimum, parsed));
	const stepOffset = (clamped - minimum) / step;
	const roundingTolerance = Number.EPSILON * Math.max(1, Math.abs(stepOffset));
	const snapped = minimum + Math.round(stepOffset + roundingTolerance) * step;
	const digits = decimalPlaces(step);
	return Number(Math.min(maximum, Math.max(minimum, snapped)).toFixed(digits));
};

export const histogramPercent = (count: number, total: number): number =>
	total <= 0 ? 0 : (count / total) * 100;

export const histogramLogCount = (count: number): number =>
	Math.log10(1 + count);

export const histogramCountFromLog = (value: number): number =>
	Math.max(0, Math.round(10 ** value - 1));

export const getHistogramBinRange = (
	edges: number[],
	binIndex: number,
): [number, number] | undefined => {
	if (
		!Number.isInteger(binIndex) ||
		binIndex < 0 ||
		binIndex + 1 >= edges.length
	) {
		return undefined;
	}
	const lower = edges[binIndex];
	const upper = edges[binIndex + 1];
	return lower == null || upper == null ? undefined : [lower, upper];
};

export const moveHistogramRange = (
	range: [number, number],
	delta: number,
	minimum: number,
	maximum: number,
	step: number,
): [number, number] => {
	const width = range[1] - range[0];
	if (width >= maximum - minimum) return [minimum, maximum];
	const stepDelta = Math.round(delta / step) * step;
	const lower = Math.min(
		maximum - width,
		Math.max(minimum, range[0] + stepDelta),
	);
	const digits = decimalPlaces(step);
	const normalizedLower = Number(lower.toFixed(digits));
	return [normalizedLower, Number((normalizedLower + width).toFixed(digits))];
};
