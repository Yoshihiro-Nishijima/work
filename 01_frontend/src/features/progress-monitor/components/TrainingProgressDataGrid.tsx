import { Box, Menu, MenuItem, Stack, styled } from "@mui/material";
import {
	DataGridPro,
	type GridColDef,
	GridColumnMenu,
	type GridColumnMenuProps,
	gridClasses,
} from "@mui/x-data-grid-pro";
import { toLocalDateStr } from "utils/formatter";

import { useMemo, useState } from "react";
import { ProgressBar, sortToolTipText } from "~/components/elements";
import { WithSortableHeaderTooltip } from "~/components/elements/DataGrid/WithSortableHeaderTooltip";
import { DISABLE_VIRTULIZATION } from "~/config";
import { toSortParam } from "~/features/job-manager-info/types";
import { useDataGridColumnOrder } from "~/lib/useDataGridColumnOrder";
import { useCancelTrainingProgressInfo } from "../hooks/useCancelTrainingProgressInfo";
import { useTrainingProgressGridState } from "../hooks/useTrainingProgressGridState";
import { useTrainingProgressInfo } from "../hooks/useTrainingProgressInfo";

// 2行分を1行風に表示する DataGrid
const RowSpanningDataGrid = styled(DataGridPro)(() => ({
	[`& .${gridClasses.row}.even`]: {
		"& .MuiDataGrid-cell": {
			border: 0,
		},
	},
	[`& .${gridClasses.row}.odd`]: {
		"& .MuiDataGrid-cell": {
			border: 0,
			borderBottom: "1px solid rgba(128, 128, 128, 0.35)",
		},
	},
}));

// デフォルト列設定
const defaultColDef = {
	sortable: true,
	filterable: false,
	minWidth: 30,
	maxWidth: 1000,
};
const columns: GridColDef[] = [
	{
		...defaultColDef,
		field: "id",
		headerName: "No",
		width: 100,
		// 2行目まで非表示となるため、非表示不可とする
		hideable: false,
		// 2行目まで移動してしまうため、固定とする
		disableReorder: true,
		renderCell: (params) => {
			if (Number(params.id) % 2 === 1) {
				return (
					<Stack direction="row" spacing={2}>
						<div>Create Leaning Data Job Started on</div>
						<Box sx={{ color: "primary.dark" }}>
							{toLocalDateStr(params.row.executionDate)}
						</Box>
						<div>Job Finish Prospect time</div>
						<Box sx={{ color: "primary.dark" }}>
							{toLocalDateStr(params.row.finishProspectDate)}
						</Box>
					</Stack>
				);
			}
		},
		colSpan: (params) => (Number(params.id) % 2 === 0 ? 1 : 15),
	},
	{
		...defaultColDef,
		field: "status",
		headerName: "Status",
		width: 150,
	},
	{
		...defaultColDef,
		field: "jobType",
		headerName: "Job Type",
		width: 150,
		sortable: false,
	},
	{
		...defaultColDef,
		field: "modelName",
		headerName: "Target Name",
		width: 150,
	},
	{
		...defaultColDef,
		field: "processState",
		headerName: "Process State",
		width: 150,
	},
	{
		...defaultColDef,
		field: "submitDate",
		headerName: "Submit Date",
		width: 150,
		valueFormatter: ({ value }) => Boolean(value) && toLocalDateStr(value),
	},
	{
		...defaultColDef,
		field: "progress",
		headerName: "Progress",
		width: 300,
		renderCell: (params) => {
			return <ProgressBar value={params.row.progress} minWidth={200} />;
		},
	},
];

// column manage のみが利用可能なカスタムカラムメニュー
export const ColumnManageOnlyColumnMenu = (
	props: GridColumnMenuProps,
): JSX.Element => {
	return (
		<GridColumnMenu
			{...props}
			slots={{
				// Hide `Sort`
				columnMenuSortItem: null,
				// Hide `Filter`
				columnMenuFilterItem: null,
				// Hide `Pinning`
				columnMenuPinningItem: null,
				// Hide `Aggregate`
				columnMenuAggregationItem: null,
				// Hide `Grouping`
				columnMenuGroupingItem: null,
			}}
		/>
	);
};

export function TrainingProgressDataGrid(): JSX.Element {
	const {
		columnVisibilityModel,
		setColumnVisibilityModel,
		sort: gridSort,
		setSort: setGridSort,
	} = useTrainingProgressGridState();
	const { trainingProgressInfos, setSort } = useTrainingProgressInfo(
		toSortParam(gridSort),
	);
	const { doCancel } = useCancelTrainingProgressInfo();
	const [selectedTrainingProgressId, setSelectedTrainingProgressId] = useState<
		number | undefined
	>(undefined);

	const [contextMenu, setContextMenu] = useState<
		| {
				mouseX: number;
				mouseY: number;
		  }
		| undefined
	>(undefined);
	const { orderedColumns, handleColumnOrderChange } = useDataGridColumnOrder(
		columns,
		"trainingProgressDataGrid",
	);
	const tooltipColumns = useMemo(() => {
		return WithSortableHeaderTooltip(orderedColumns);
	}, [orderedColumns]);

	const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>): void => {
		event.preventDefault();
		const rowIndex = Number(event.currentTarget.getAttribute("data-rowindex"));
		setSelectedTrainingProgressId(trainingProgressInfos[rowIndex].id);

		setContextMenu(
			contextMenu == null
				? { mouseX: event.clientX - 2, mouseY: event.clientY - 4 }
				: undefined,
		);
	};
	const handleClose = (): void => {
		setContextMenu(undefined);
		setSelectedTrainingProgressId(undefined);
	};

	const handleCancel = (): void => {
		if (selectedTrainingProgressId != null) {
			doCancel(selectedTrainingProgressId);
		}
		handleClose();
	};

	return (
		<>
			<RowSpanningDataGrid
				getRowClassName={(params) =>
					params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
				}
				sx={{ height: "100%", width: "100%" }}
				rows={trainingProgressInfos}
				slots={{ columnMenu: ColumnManageOnlyColumnMenu }}
				slotProps={{
					row: {
						onContextMenu: handleContextMenu,
						style: { cursor: "context-menu" },
					},
				}}
				columns={tooltipColumns}
				getRowId={(row) => row.idx}
				localeText={sortToolTipText}
				hideFooter
				columnHeaderHeight={35}
				disableMultipleRowSelection
				disableVirtualization={DISABLE_VIRTULIZATION}
				rowHeight={30}
				// ソート条件指定時
				sortingMode="server"
				sortModel={gridSort}
				onSortModelChange={(sorting) => {
					setGridSort(sorting);
					setSort(toSortParam(sorting));
				}}
				// カラム表示/非表示
				columnVisibilityModel={columnVisibilityModel}
				onColumnVisibilityModelChange={setColumnVisibilityModel}
				onColumnOrderChange={handleColumnOrderChange}
				isRowSelectable={() => false}
			/>
			<Menu
				open={contextMenu != null}
				onClose={handleClose}
				anchorReference="anchorPosition"
				anchorPosition={
					contextMenu != null
						? { top: contextMenu.mouseY, left: contextMenu.mouseX }
						: undefined
				}
				slotProps={{
					root: {
						onContextMenu: (e) => {
							e.preventDefault();
							handleClose();
						},
					},
				}}
			>
				<MenuItem onClick={handleCancel}>Cancel</MenuItem>
			</Menu>
		</>
	);
}
