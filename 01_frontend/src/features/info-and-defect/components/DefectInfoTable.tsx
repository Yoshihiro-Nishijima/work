import { Box } from "@mui/material";
import { StyledTable } from "~/components/elements";
import { useImagesDefectInfo } from "../hooks/useDefectInfo";

const rowHeight = 20;

export const DefectInfoTable = (): JSX.Element => {
	const { defectInfoTable } = useImagesDefectInfo();
	// テーブルコンポーネント全体の高さは、4行分の高さ + padding上下分 + ２行分の border分
	const tableHeight = 4 * (rowHeight + 12) + 2;
	return (
		<Box
			sx={{
				height: tableHeight,
				overflow: "auto",
			}}
		>
			<StyledTable dataList={defectInfoTable} />
		</Box>
	);
};
