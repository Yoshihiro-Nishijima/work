import {
	type GridFilterOperator,
	getGridNumericOperators,
} from "@mui/x-data-grid-pro";
import { useCallback, useMemo } from "react";

import { DefectHistogramFilterInput } from "../components/DefectHistogramFilterInput";
import { isDefectHistogramField } from "../types";
import { useDefectHistogram } from "./useDefectHistogram";

export const useDefectHistogramFilterOperators = (): {
	defectHistogramFilterOperators: GridFilterOperator[];
} => {
	const { addHistogram } = useDefectHistogram();
	const openHistogram = useCallback(
		(field: string, item: Parameters<typeof addHistogram>[1]) => {
			if (!isDefectHistogramField(field)) return;
			addHistogram(field, item);
		},
		[addHistogram],
	);
	return {
		defectHistogramFilterOperators: useMemo(
			() =>
				getGridNumericOperators().map((operator) => ({
					...operator,
					InputComponent: DefectHistogramFilterInput,
					InputComponentProps: { onOpenHistogram: openHistogram },
				})),
			[openHistogram],
		),
	};
};
