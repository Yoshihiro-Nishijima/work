export const DEFAULT_MAX_COUNT = 1;
export const DEFAULT_COLOR_MAP_SETTINGS: ColorMapSettings = {
	maxCount: DEFAULT_MAX_COUNT,
	presetId: "orange-brown",
};

export const COLOR_MAP_TICK_FRACTIONS = [0, 0.25, 0.5, 0.75, 1] as const;

export type ColorMapPresetId =
	| "orange-brown"
	| "blue"
	| "spectrum"
	| "grayscale";

export interface ColorMapSettings {
	maxCount: number;
	presetId: ColorMapPresetId;
}

export interface ColorStop {
	position: number;
	color: string;
}

export interface ColorMapPreset {
	id: ColorMapPresetId;
	label: string;
	stops: readonly ColorStop[];
}

export const COLOR_MAP_PRESETS: readonly ColorMapPreset[] = [
	{
		id: "orange-brown",
		label: "橙色から茶色",
		stops: [
			{ position: 0, color: "#FFF3E0" },
			{ position: 0.25, color: "#FFCC80" },
			{ position: 0.5, color: "#FF9800" },
			{ position: 0.75, color: "#F4511E" },
			{ position: 1, color: "#4E342E" },
		],
	},
	{
		id: "blue",
		label: "薄い青から濃い青",
		stops: [
			{ position: 0, color: "#E3F2FD" },
			{ position: 1, color: "#0D47A1" },
		],
	},
	{
		id: "spectrum",
		label: "紫・赤・橙・黄",
		stops: [
			{ position: 0, color: "#7B1FA2" },
			{ position: 1 / 3, color: "#E53935" },
			{ position: 2 / 3, color: "#FB8C00" },
			{ position: 1, color: "#FFEB3B" },
		],
	},
	{
		id: "grayscale",
		label: "白から黒",
		stops: [
			{ position: 0, color: "#FFFFFF" },
			{ position: 1, color: "#000000" },
		],
	},
];

export const getColorMapPreset = (presetId: ColorMapPresetId): ColorMapPreset =>
	COLOR_MAP_PRESETS.find((preset) => preset.id === presetId) ??
	COLOR_MAP_PRESETS[0];

export const getColorMapRatio = (count: number, maxCount: number): number => {
	if (!Number.isFinite(count) || !Number.isFinite(maxCount) || maxCount <= 0) {
		return 0;
	}
	return Math.max(0, Math.min(1, count / maxCount));
};

const hexToRgb = (hex: string): [number, number, number] => {
	const value = hex.replace("#", "");
	return [
		Number.parseInt(value.slice(0, 2), 16),
		Number.parseInt(value.slice(2, 4), 16),
		Number.parseInt(value.slice(4, 6), 16),
	];
};

const rgbToHex = (red: number, green: number, blue: number): string =>
	`#${[red, green, blue]
		.map((value) => Math.round(value).toString(16).padStart(2, "0"))
		.join("")
		.toUpperCase()}`;

export const getColorMapColor = (
	count: number,
	maxCount: number,
	presetId: ColorMapPresetId,
): string => {
	const stops = getColorMapPreset(presetId).stops;
	const ratio = getColorMapRatio(count, maxCount);
	const rightIndex = stops.findIndex((stop) => stop.position >= ratio);
	if (rightIndex <= 0) return stops[0].color;
	if (rightIndex < 0) return stops[stops.length - 1].color;

	const left = stops[rightIndex - 1];
	const right = stops[rightIndex];
	const localRatio =
		(right.position === left.position
			? 0
			: (ratio - left.position) / (right.position - left.position)) || 0;
	const leftRgb = hexToRgb(left.color);
	const rightRgb = hexToRgb(right.color);
	return rgbToHex(
		leftRgb[0] + (rightRgb[0] - leftRgb[0]) * localRatio,
		leftRgb[1] + (rightRgb[1] - leftRgb[1]) * localRatio,
		leftRgb[2] + (rightRgb[2] - leftRgb[2]) * localRatio,
	);
};

export const getPixiColor = (
	count: number,
	maxCount: number,
	presetId: ColorMapPresetId,
): number => Number.parseInt(getColorMapColor(count, maxCount, presetId).slice(1), 16);

export const getColorMapGradient = (presetId: ColorMapPresetId): string => {
	const stops = getColorMapPreset(presetId).stops;
	const cssStops = stops
		.map((stop) => `${stop.color} ${stop.position * 100}%`)
		.join(", ");
	return `linear-gradient(to right, ${cssStops})`;
};

export const getColorMapTicks = (maxCount: number): number[] =>
	COLOR_MAP_TICK_FRACTIONS.map((fraction) => Math.round(maxCount * fraction));