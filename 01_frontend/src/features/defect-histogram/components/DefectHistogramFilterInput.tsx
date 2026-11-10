import { Box, Button } from "@mui/material";
import {
	GridFilterInputValue,
	type GridFilterInputValueProps,
} from "@mui/x-data-grid-pro";
import type { GridFilterItem } from "@mui/x-data-grid-pro";
import { getDefectHistogramFilterSnapshot } from "../utils/filterSnapshot";

type Props = GridFilterInputValueProps & {
	onOpenHistogram: (field: string, item?: GridFilterItem) => void;
};

export const DefectHistogramFilterInput = ({
	onOpenHistogram,
	item,
	apiRef,
	...inputProps
}: Props): JSX.Element => {
	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
			<Box sx={{ minWidth: 0 }}>
				<GridFilterInputValue item={item} apiRef={apiRef} {...inputProps} />
			</Box>
			<Button
				variant="text"
				onClick={() =>
					onOpenHistogram(
						item.field,
						getDefectHistogramFilterSnapshot(item),
					)
				}
				sx={{ flexShrink: 0, whiteSpace: "nowrap" }}
			>
				HISTOGRAM
			</Button>
		</Box>
	);
};
