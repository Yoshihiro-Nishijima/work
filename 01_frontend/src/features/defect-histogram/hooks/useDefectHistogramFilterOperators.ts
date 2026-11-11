import {
	type GridFilterOperator,
	getGridNumericOperators,
} from "@mui/x-data-grid-pro";
import { useCallback, useMemo } from "react";

import { DefectHistogramFilterInput } from "../components/DefectHistogramFilterInput";
import { isDefectHistogramField } from "../types";
import { DEFECT_HISTOGRAM_FIELD_REGISTRY } from "../types/registry";
import { useDefectHistogram } from "./useDefectHistogram";

export const useDefectHistogramFilterOperators = (
	fieldHeaderNames: Readonly<Record<string, string>>,
): {
	defectHistogramFilterOperators: GridFilterOperator[];
} => {
	const { addHistogram } = useDefectHistogram();
	const openHistogram = useCallback(
		(field: string, item: Parameters<typeof addHistogram>[1]) => {
			if (!isDefectHistogramField(field)) return;
			const fieldLabel = fieldHeaderNames[field];
			if (fieldLabel == null) {
				throw new Error(
					`Missing DataGrid headerName for histogram field: ${field}`,
				);
			}
			addHistogram(field, item, fieldLabel);
		},
		[addHistogram, fieldHeaderNames],
	);
	return {
		defectHistogramFilterOperators: useMemo(() => {
			const allowedOperators = new Set<string>(
				Object.values(DEFECT_HISTOGRAM_FIELD_REGISTRY).flatMap(
					(definition) => definition.allowedOperators,
				),
			);
			return getGridNumericOperators()
				.filter((operator) => allowedOperators.has(operator.value))
				.map((operator) => ({
					...operator,
					InputComponent: DefectHistogramFilterInput,
					InputComponentProps: { onOpenHistogram: openHistogram },
				}));
		}, [openHistogram]),
	};
};
