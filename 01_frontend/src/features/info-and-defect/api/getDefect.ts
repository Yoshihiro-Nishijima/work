import { type GridFilterModel, GridLogicOperator } from "@mui/x-data-grid-pro";

import { getDefect as getDefect_ } from "~/features/defect-list/api/getDefect";
import type { DefectRecord } from "~/features/defect-list/types";

import type { DefectGetParam } from "../types";

export const getDefect = async (
	param: DefectGetParam,
	signal: AbortSignal,
): Promise<{ total: number; defects: DefectRecord[] }> => {
	const query: GridFilterModel = {
		items: [
			{ field: "mFOVno", operator: "=", value: param.mfovNo },
			{ field: "sFOVno", operator: "=", value: param.sfovNo },
		],
		logicOperator: GridLogicOperator.And,
	};

	return getDefect_(
		param.target,
		`filter=${encodeURIComponent(JSON.stringify(query))}`,
		signal,
	);
};
