import { Box } from "@mui/material";
import { StyledTable } from "~/components/elements";
import { useImageInfo } from "../hooks/useImageInfo";

const toFormatStr = (value: number): string => `${value} um`;

const rowHeight = 20;

export const ImageInfoDataGrid = (): JSX.Element => {
	const { imageInfoList } = useImageInfo();
	// StyledTable設定前にフォーマット関数を適用
	const toFormatImageInfoList = imageInfoList.map((dataInfo) => {
		return { item: dataInfo.item, value: toFormatStr(dataInfo.value) };
	});
	// テーブルコンポーネント全体の高さは、4行分の高さ + padding上下分 + ２行分の border分
	const tableHeight = 4 * (rowHeight + 12) + 2;
	return (
		<Box
			sx={{
				height: tableHeight,
				overflow: "auto",
			}}
		>
			<StyledTable dataList={toFormatImageInfoList} />
		</Box>
	);
};
