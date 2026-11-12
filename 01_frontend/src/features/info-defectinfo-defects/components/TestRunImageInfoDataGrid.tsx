import { Box } from "@mui/material";
import { StyledTable, type StyledTableInfo } from "~/components/elements";
import { useTestRunState } from "~/features/recipe/hooks";

const rowHeight = 20;

export const TestRunImageInfoDataGrid = (): JSX.Element => {
	const { sFov } = useTestRunState();
	const testRunImageInfoTable: StyledTableInfo[] =
		sFov == null
			? []
			: [
					{ item: "Image No", value: sFov.imageNo },
					{ item: "mFOV No", value: sFov.mfovNo },
					{ item: "sFOV No", value: sFov.sfovNo },
					{ item: "Area No", value: sFov.areaNo },
					{ item: "Chip", value: `${sFov.chipX}, ${sFov.chipY}` },
					{ item: "nm / pixel", value: sFov.pixelSize },
				];
	// テーブルコンポーネント全体の高さは、8行分の高さ + padding上下分 + ２行分の border分
	const tableHeight = 8 * (rowHeight + 12) + 2;
	return (
		<Box
			sx={{
				height: tableHeight,
				overflow: "auto",
			}}
		>
			<StyledTable dataList={testRunImageInfoTable} />
		</Box>
	);
};
