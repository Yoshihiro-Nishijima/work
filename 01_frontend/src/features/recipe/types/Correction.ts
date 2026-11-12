export interface CorrectionParam {
	correctionMagX: number;
	correctionMagY: number;
	correctionRotation: number;
	digitalABCC: DigitalABCC;
}

export interface DigitalABCC {
	enabled: boolean;
	method: ABCCMethod;

	// Deep Curve Estimation
	percentileThreshold: number;
	downscalingFactor: number;
	contrastGain: number;
	brightnessBias: number;

	// Global Linear Correction
	shadows: number;
	midtones: number;
	highlights: number;
}

export type ABCCMethod = (typeof ABCCMethodList)[number];
export const ABCCMethodList = [
	"Deep Curve Estimation",
	"Global Linear Correction",
] as const;
