import { StyledTable } from "~/components/elements";
import { toLocalDateStr, toTimeStr } from "~/utils/formatter";
import { isNumber } from "~/utils/numUtils";
import type { ModelDetailItem } from "../types";

interface TrainingDataProp {
	dataList: ModelDetailItem[];
}

export const TrainingData = (props: TrainingDataProp): JSX.Element => {
	// 日時の項目を表示用に変換
	const dataList = props.dataList.map((data) => {
		if (!data.value) return data;
		if (data.item === "Execution Date" && isNumber(data.value)) {
			return { ...data, value: toLocalDateStr(Number(data.value)) };
		}
		if (data.item === "Process Time" && isNumber(data.value)) {
			return { ...data, value: toTimeStr(Number(data.value)) };
		}
		return data;
	});
	return <StyledTable dataList={dataList} rowHeight={18} />;
};
