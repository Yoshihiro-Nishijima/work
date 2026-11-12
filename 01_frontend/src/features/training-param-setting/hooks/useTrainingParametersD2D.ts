import { atom, useAtom } from "jotai";

// TrainingParameterD2Dで使用
export type TrainingCountType = "Epoch" | "Iteration";

const trainingCountTypeAtom = atom<TrainingCountType>("Epoch");
const segmentsTrainingCountTypeAtom = atom<TrainingCountType>("Epoch");
const trainingCountAtom = atom(4);
const segmentsTrainingCountAtom = atom(25);
const clipLimitValueAtom = atom(2);
const blockSizeValueAtom = atom(256);
const sigmaColorValueAtom = atom(8);
const sigmaSpaceValueAtom = atom(1);
const ratioValueAtom = atom(1.0);
const numberOfSegmentsValueAtom = atom(5);
const dummyRatioValueAtom = atom(1);
const isBrightnessAtom = atom(true);
const isBlurAtom = atom(false);
const isZoomAtom = atom(false);
const isSegmentationAtom = atom(false);

interface UseTrainingParameterD2D {
	trainingCountType: TrainingCountType;
	segmentsTrainingCountType: TrainingCountType;
	trainingCount: number;
	segmentsTrainingCount: number;
	clipLimitValue: number;
	blockSizeValue: number;
	sigmaColorValue: number;
	sigmaSpaceValue: number;
	ratioValue: number;
	numberOfSegmentsValue: number;
	dummyRatioValue: number;
	isBrightness: boolean;
	isBlur: boolean;
	isZoom: boolean;
	isSegmentation: boolean;
	setTrainingCountType: (value: TrainingCountType) => void;
	setSegmentsTrainingCountType: (value: TrainingCountType) => void;
	setTrainingCount: (value: number) => void;
	setSegmentsTrainingCount: (value: number) => void;
	setClipLimitValue: (value: number) => void;
	setBlockSizeValue: (value: number) => void;
	setSigmaColorValue: (value: number) => void;
	setSigmaSpaceValue: (value: number) => void;
	setRatioValue: (value: number) => void;
	setNumberOfSegmentsValue: (value: number) => void;
	setDummyRatioValue: (value: number) => void;
	setIsBrightness: (value: boolean) => void;
	setIsBlur: (value: boolean) => void;
	setIsZoom: (value: boolean) => void;
	setIsSegmentation: (value: boolean) => void;
	setDefaultValueTrainingParameterD2D: () => void;
	setMinValueTrainingParameterD2D: () => void;
}

export const useTrainingParameterD2D = (): UseTrainingParameterD2D => {
	const [trainingCountType, setTrainingCountType] = useAtom(
		trainingCountTypeAtom,
	);
	const [segmentsTrainingCountType, setSegmentsTrainingCountType] =
		useAtom(segmentsTrainingCountTypeAtom);
	const [trainingCount, setTrainingCount] = useAtom(trainingCountAtom);
	const [segmentsTrainingCount, setSegmentsTrainingCount] = useAtom(
		segmentsTrainingCountAtom,
	);
	const [clipLimitValue, setClipLimitValue] =
		useAtom(clipLimitValueAtom);
	const [blockSizeValue, setBlockSizeValue] =
		useAtom(blockSizeValueAtom);
	const [sigmaColorValue, setSigmaColorValue] =
		useAtom(sigmaColorValueAtom);
	const [sigmaSpaceValue, setSigmaSpaceValue] =
		useAtom(sigmaSpaceValueAtom);
	const [ratioValue, setRatioValue] = useAtom(ratioValueAtom);
	const [numberOfSegmentsValue, setNumberOfSegmentsValue] = useAtom(
		numberOfSegmentsValueAtom,
	);
	const [dummyRatioValue, setDummyRatioValue] = useAtom(dummyRatioValueAtom);
	const [isBrightness, setIsBrightness] = useAtom(isBrightnessAtom);
	const [isBlur, setIsBlur] = useAtom(isBlurAtom);
	const [isZoom, setIsZoom] = useAtom(isZoomAtom);
	const [isSegmentation, setIsSegmentation] =
		useAtom(isSegmentationAtom);

	const setDefaultValueTrainingParameterD2D = (): void => {
		setTrainingCountType("Epoch");
		setSegmentsTrainingCountType("Epoch");
		setTrainingCount(4);
		setSegmentsTrainingCount(25);
		setClipLimitValue(2);
		setBlockSizeValue(256);
		setSigmaColorValue(8);
		setSigmaSpaceValue(1);
		setRatioValue(1.0);
		setNumberOfSegmentsValue(5);
		setDummyRatioValue(1);
		setIsBrightness(true);
		setIsBlur(false);
		setIsZoom(false);
		setIsSegmentation(false);
	};

	const setMinValueTrainingParameterD2D = (): void => {
		setTrainingCountType("Epoch");
		setSegmentsTrainingCountType("Epoch");
		setTrainingCount(1);
		setSegmentsTrainingCount(1);
		setClipLimitValue(1);
		setBlockSizeValue(128);
		setSigmaColorValue(1);
		setSigmaSpaceValue(1);
		setRatioValue(0.1);
		setNumberOfSegmentsValue(1);
		setDummyRatioValue(1);
		setIsBrightness(false);
		setIsBlur(false);
		setIsZoom(false);
		setIsSegmentation(false);
	};

	return {
		trainingCountType,
		segmentsTrainingCountType,
		trainingCount,
		segmentsTrainingCount,
		clipLimitValue,
		blockSizeValue,
		sigmaColorValue,
		sigmaSpaceValue,
		ratioValue,
		numberOfSegmentsValue,
		dummyRatioValue,
		isBrightness,
		isBlur,
		isZoom,
		isSegmentation,
		setTrainingCountType,
		setSegmentsTrainingCountType,
		setTrainingCount,
		setSegmentsTrainingCount,
		setClipLimitValue,
		setBlockSizeValue,
		setSigmaColorValue,
		setSigmaSpaceValue,
		setRatioValue,
		setNumberOfSegmentsValue,
		setDummyRatioValue,
		setIsBrightness,
		setIsBlur,
		setIsZoom,
		setIsSegmentation,
		setDefaultValueTrainingParameterD2D,
		setMinValueTrainingParameterD2D,
	};
};
