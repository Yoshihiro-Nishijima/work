import { Box, Menu, Stack, styled } from "@mui/material";
import {
	DataGridPro,
	type GridColDef,
	gridClasses,
} from "@mui/x-data-grid-pro";
import { type MouseEvent, memo, useState } from "react";
import { toLocalDateStr } from "utils/formatter";

import { ProgressBar } from "~/components/elements";
import { SizedContainer } from "~/components/elements/SizedContainer";
import { DISABLE_VIRTULIZATION } from "~/config";
import { useDataGridColumnOrder } from "~/lib/useDataGridColumnOrder";

import { useJobProgressGridState } from "../hooks/useJobProgressGridState";
import { useJobProgressInfo } from "../hooks/useJobProgressInfo";
import { CancelMenu } from "./CancelMenu";
import { DiskAvailableToolBar } from "./DiskAvailableToolBar";
import { ShowImagesMenu } from "./ShowImagesMenu";

// JobProgressDataGrid専用のツールバーコンポーネント（メモ化して再レンダリングを防止）
const MemoizedJobProgressToolBar = memo(() => {
	return <DiskAvailableToolBar hiddenFilterButton={true} />;
});

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
	sortable: false,
	filterable: false,
	minWidth: 30,
	maxWidth: 1000,
};

const columns: GridColDef[] = [
	{
		...defaultColDef,
		field: "status",
		headerName: "Status",
		width: 150,
		// 2行目まで非表示となるため、非表示不可とする
		hideable: false,
		// 2行目まで移動してしまうため、固定とする
		disableReorder: true,
		renderCell: (params) => {
			if (Number(params.id) % 2 === 0) {
				return <Box>{params.row.status}</Box>;
			}
			return (
				<Stack direction="row" spacing={2}>
					<ProgressBar value={Number(params.row.status)} minWidth={200} />
					<div>Estimated Completion: </div>
					<Box sx={{ color: "primary.dark" }}>
						{toLocalDateStr(params.row.executionDate)}
					</Box>
				</Stack>
			);
		},
		colSpan: (params) => (Number(params.id) % 2 === 0 ? 1 : 15),
	},
	{
		...defaultColDef,
		field: "processStatus",
		headerName: "Process Status",
		width: 150,
	},
	{
		...defaultColDef,
		field: "executionDate",
		headerName: "Execution Date",
		width: 200,
		valueFormatter: ({ value }) => Boolean(value) && toLocalDateStr(value),
	},
	{
		...defaultColDef,
		field: "class",
		headerName: "Class",
		width: 150,
	},
	{
		...defaultColDef,
		field: "idw",
		headerName: "IDW",
		width: 150,
	},
	{
		...defaultColDef,
		field: "idp",
		headerName: "IDP",
		width: 150,
	},
	{
		...defaultColDef,
		field: "recipe",
		headerName: "Recipe",
		width: 150,
	},
	{
		...defaultColDef,
		field: "port",
		headerName: "Port",
		width: 100,
	},
	{
		...defaultColDef,
		field: "slotNo",
		headerName: "Slot",
		width: 100,
	},
	{
		...defaultColDef,
		field: "lotID",
		headerName: "Lot ID",
		width: 150,
	},
	{
		...defaultColDef,
		field: "processID",
		headerName: "Process ID",
		width: 150,
	},
	{
		...defaultColDef,
		field: "jobType",
		headerName: "Job Type",
		width: 150,
	},
	{
		...defaultColDef,
		field: "operator",
		headerName: "Operator",
		width: 150,
	},
];

export function JobProgressDataGrid(): JSX.Element {
	const { jobProgressInfos, rowSelection, setSelectedJobProgressIdx } =
		useJobProgressInfo();
	const { columnVisibilityModel, setColumnVisibilityModel } =
		useJobProgressGridState();
	const { orderedColumns, handleColumnOrderChange } = useDataGridColumnOrder(
		columns,
		"jobProgressDataGrid",
	);

	const [contextMenu, setContextMenu] = useState<
		| {
				mouseX: number;
				mouseY: number;
		  }
		| undefined
	>(undefined);

	const handleContextMenu = (event: MouseEvent): void => {
		event.preventDefault();
		const contextRowIdx = Number(event.currentTarget.getAttribute("data-id"));
		setSelectedJobProgressIdx(contextRowIdx);
		setContextMenu(
			contextMenu == null
				? { mouseX: event.clientX - 2, mouseY: event.clientY - 4 }
				: undefined,
		);
	};

	const handleClose = (): void => {
		setContextMenu(undefined);
	};

	return (
		<>
			<SizedContainer>
				<RowSpanningDataGrid
					getRowClassName={(params) =>
						params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
					}
					sx={{ height: "100%", width: "100%", minWidth: 0 }}
					rows={jobProgressInfos}
					slots={{
						toolbar: MemoizedJobProgressToolBar,
					}}
					slotProps={{
						row: {
							onContextMenu: handleContextMenu,
							style: { cursor: "context-menu" },
						},
					}}
					columns={orderedColumns}
					getRowId={(row) => row.idx}
					hideFooter
					disableColumnMenu
					columnHeaderHeight={35}
					disableMultipleRowSelection
					disableVirtualization={DISABLE_VIRTULIZATION}
					rowHeight={30}
					columnVisibilityModel={columnVisibilityModel}
					onColumnVisibilityModelChange={setColumnVisibilityModel}
					onColumnOrderChange={handleColumnOrderChange}
					onRowSelectionModelChange={(selectedRow) => {
						setSelectedJobProgressIdx(Number(selectedRow[0]));
					}}
					rowSelectionModel={rowSelection}
				/>
			</SizedContainer>
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
				<ShowImagesMenu onClose={handleClose} />
				<CancelMenu onClose={handleClose} />
			</Menu>
		</>
	);
}
