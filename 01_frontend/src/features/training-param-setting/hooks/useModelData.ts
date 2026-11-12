import { atom, useAtom } from "jotai";
import type { ModelDetailItem } from "../types";

// TrainingDataListのデータ管理で使用
const modelDetailListAtom = atom<ModelDetailItem[]>([]);

interface UseModelData {
	// TrainingDataリスト表示で使用
	modelDetailList: ModelDetailItem[];
	setModelDetailList: (value: ModelDetailItem[]) => void;
	setMinValueModelData: () => void;
}

export const useModelData = (): UseModelData => {
	// trainingDataListのデータ管理用
	const [modelDetailList, setModelDetailList] = useAtom(modelDetailListAtom);

	const setMinValueModelData = (): void => {
		const initTrainingDataList = [
			{ item: "Execution Date", value: "" },
			{ item: "JobType", value: "" },
			{ item: "Process Time", value: "" },
			{ item: "Images", value: "" },
			{ item: "Class", value: "" },
			{ item: "IDW", value: "" },
			{ item: "IDP", value: "" },
			{ item: "Recipe", value: "" },
			{ item: "Comment", value: "" },
			{ item: "Result Name", value: "" },
		];
		setModelDetailList(initTrainingDataList);
	};

	return {
		modelDetailList,
		setModelDetailList,
		setMinValueModelData,
	};
};
