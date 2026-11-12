import { atom, useAtom } from "jotai";

const iterationValueAtom = atom(1000);
const isShadingCorrectionAtom = atom(false);
const shadingLevelTypeAtom = atom(1);
const isGaussFilterAtom = atom(false);
const gaussFilterLevelTypeAtom = atom(1);
const isDyadicAtom = atom(false);

interface UseTrainingParameterD2DB {
	iterationValue: number;
	isShadingCorrection: boolean;
	shadingLevelType: number;
	isGaussFilter: boolean;
	gaussFilterLevelType: number;
	isDyadic: boolean;
	setIterationValue: (value: number) => void;
	setIsShadingCorrection: (value: boolean) => void;
	setShadingLevelType: (value: number) => void;
	setIsGaussFilter: (value: boolean) => void;
	setGaussFilterLevelType: (value: number) => void;
	setIsDyadic: (value: boolean) => void;
	setDefaultValueTrainingParameterD2DB: () => void;
	setMinValueTrainingParameterD2DB: () => void;
}

export const useTrainingParameterD2DB = (): UseTrainingParameterD2DB => {
	const [iterationValue, setIterationValue] = useAtom(iterationValueAtom);
	const [isShadingCorrection, setIsShadingCorrection] = useAtom(
		isShadingCorrectionAtom,
	);
	const [shadingLevelType, setShadingLevelType] = useAtom(shadingLevelTypeAtom);
	const [isGaussFilter, setIsGaussFilter] = useAtom(isGaussFilterAtom);
	const [gaussFilterLevelType, setGaussFilterLevelType] = useAtom(
		gaussFilterLevelTypeAtom,
	);
	const [isDyadic, setIsDyadic] = useAtom(isDyadicAtom);

	const setDefaultValueTrainingParameterD2DB = (): void => {
		setIterationValue(1000);
		setIsShadingCorrection(false);
		setShadingLevelType(1);
		setIsGaussFilter(false);
		setGaussFilterLevelType(1);
		setIsDyadic(false);
	};

	const setMinValueTrainingParameterD2DB = (): void => {
		setIterationValue(1);
		setIsShadingCorrection(false);
		setShadingLevelType(1);
		setIsGaussFilter(false);
		setGaussFilterLevelType(1);
		setIsDyadic(false);
	};

	return {
		iterationValue,
		isShadingCorrection,
		shadingLevelType,
		isGaussFilter,
		gaussFilterLevelType,
		isDyadic,
		setIterationValue,
		setIsShadingCorrection,
		setShadingLevelType,
		setIsGaussFilter,
		setGaussFilterLevelType,
		setIsDyadic,
		setDefaultValueTrainingParameterD2DB,
		setMinValueTrainingParameterD2DB,
	};
};
