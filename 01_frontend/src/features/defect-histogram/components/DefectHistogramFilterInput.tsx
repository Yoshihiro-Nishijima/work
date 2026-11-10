import { Box, Button } from "@mui/material";
import {
	GridFilterInputValue,
	type GridFilterInputValueProps,
} from "@mui/x-data-grid-pro";
import type { GridFilterItem } from "@mui/x-data-grid-pro";

type Props = GridFilterInputValueProps & {
	onOpenHistogram: (field: string, item: GridFilterItem) => void;
};

export const DefectHistogramFilterInput = ({
	onOpenHistogram,
	item,
	apiRef,
	...inputProps
}: Props): JSX.Element => {
	const isComplete =
		(item.value != null && item.value !== "") ||
		item.operator === "isEmpty" ||
		item.operator === "isNotEmpty";
	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
			<Box sx={{ minWidth: 0 }}>
				<GridFilterInputValue item={item} apiRef={apiRef} {...inputProps} />
			</Box>
			<Button
				variant="text"
				onClick={() => onOpenHistogram(item.field, item)}
				disabled={!isComplete}
				sx={{ flexShrink: 0, whiteSpace: "nowrap" }}
			>
				HISTOGRAM
			</Button>
		</Box>
	);
};
