import FactCheckIcon from "@mui/icons-material/FactCheck";
import ImageIcon from "@mui/icons-material/Image";
import { Box, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import {
	DataGridPro,
	type GridColumnVisibilityModel,
	type GridFilterModel,
	type GridRowSelectionModel,
	type GridSortModel,
	useGridApiRef,
} from "@mui/x-data-grid-pro";
import { Point } from "pixi.js";
import { type MouseEvent, useEffect, useMemo, useRef, useState } from "react";

import { useAtomValue } from "jotai";
import {
	DataGridPaginationWithRefreshButton,
	sortToolTipText,
} from "~/components/elements";
import { WithSortableHeaderTooltip } from "~/components/elements/DataGrid/WithSortableHeaderTooltip";
import { DISABLE_VIRTULIZATION, getTestRunURL } from "~/config";
import { useSFovViewModal } from "~/features/integrated-viewer-sfov-view/hooks/useSFovViewModal";
import { useMapSelectionStatus } from "~/features/misc/hooks/useMapSelectionStatus";
import { useResultName } from "~/features/misc/hooks/useResultName";
import { useSelectedDefect } from "~/features/misc/hooks/useSelectedDefect";

import {
	toGridSortModel,
	toSortParam,
} from "~/features/job-manager-info/types/converter";
import { isFilterPending } from "~/features/misc/types/pagingQueryParam";
import { DefectDataGridToolBar } from "../components/DefectDataGridToolBar";
import {
	categoryDefectClassAtom,
	useDefect,
	useDefectColumnVisibilityModel,
} from "../hooks/useDefect";
import { useDefectFilter } from "../hooks/useDefectFilter";
import { useDefectViewColumns } from "./DefectViewColumns";

export const DefectDataGridList = (): JSX.Element => {
	const { resultName } = useResultName();
	const categoryDefectClass = useAtomValue(categoryDefectClassAtom);
	const {
		sort,
		defectList,
		total,
		pagination,
		setPagination,
		setSort,
		setDefect,
	} = useDefect({ defectClass: categoryDefectClass });
	// Thumbnail列を除外した列定義を使用
	const baseColumns = useDefectViewColumns({ enableHistogram: true }).filter(
		(col) => col.field !== "src",
	);
	const columns = useMemo(() => {
		return WithSortableHeaderTooltip(baseColumns);
	}, [baseColumns]);
	const { setGridFilterData, filterManagement } = useDefectFilter();
	const { updateSFovViewModalOpen } = useSFovViewModal();
	const { selectedDefect, setSelectedDefect } = useSelectedDefect();
	const { setSelectedChipIndex } = useMapSelectionStatus();
	const { columnVisibilityModel, setColumnVisibilityModel } =
		useDefectColumnVisibilityModel();

	const apiRef = useGridApiRef();
	const [sortModel, setSortModel] = useState<GridSortModel | undefined>(
		undefined,
	);

	const handleColumnVisibilityModelChange = (
		model: GridColumnVisibilityModel,
	) => {
		setColumnVisibilityModel(model);
	};

	// sort条件変更契機にDataGridの型に変換(ThumbnailビューはDataGrid設定なしのためビュー毎に設定)
	useEffect(() => {
		setSortModel(toGridSortModel(sort));
	}, [sort]);

	const selectedMFovNo = useRef(0);
	const selectedSFovNo = useRef(0);

	const [contextMenu, setContextMenu] = useState<
		| {
				mouseX: number;
				mouseY: number;
		  }
		| undefined
	>(undefined);

	const handleContextMenu = (event: MouseEvent): void => {
		event.preventDefault();
		const selectedIdx = Number(
			event.currentTarget.getAttribute("data-rowindex"),
		);
		selectedMFovNo.current = defectList[selectedIdx].mFOVno;
		selectedSFovNo.current = defectList[selectedIdx].sFOVno;
		setSelectedDefect(defectList[selectedIdx]);
		setSelectedChipIndex(
			new Point(defectList[selectedIdx].chipX, defectList[selectedIdx].chipY),
		);
		setContextMenu(
			contextMenu == null
				? { mouseX: event.clientX - 2, mouseY: event.clientY - 4 }
				: undefined,
		);
	};

	const handleClose = (): void => {
		setContextMenu(undefined);
		selectedMFovNo.current = 0;
		selectedSFovNo.current = 0;
	};

	const openTestRun = (): void => {
		selectedMFovNo.current !== 0 &&
			selectedSFovNo.current !== 0 &&
			window.open(
				getTestRunURL(
					resultName,
					selectedMFovNo.current,
					selectedSFovNo.current,
				),
				"Test Run",
			);
		handleClose();
	};

	const openSFovView = (): void => {
		updateSFovViewModalOpen(true);
		handleClose();
	};

	/**
	 * DataGrid操作によるSort条件の変更設定
	 * @param model DataGridのsortモデル
	 * @returns 無し
	 */
	const handleSortModelChange = (model: GridSortModel): void => {
		setSort(toSortParam(model));
	};

	/**
	 * Filters操作によるFilter条件の変更設定
	 * @param model DataGridのFilterモデル
	 * @returns 無し
	 */
	const handleFilterModelChange = (model: GridFilterModel): void => {
		const inProgress = isFilterPending(model);
		if (!inProgress) {
			setPagination({ ...pagination, page: 0 });
		}
		setGridFilterData(model, inProgress);
	};

	/**
	 * Row選択時のDefect選択行の変更設定
	 * @param model DataGridのRowSelectionモデル
	 * @returns 無し
	 */
	const handleOnRowSelectionModelChange = (
		model: GridRowSelectionModel,
	): void => {
		// Map上での欠陥点クリックもonRowSelectionModelChangeが呼ばれるためmodel未設定の場合は何もせず終了
		if (model[0] == null) return;
		const selectedRowInfo = defectList.find(
			(defect) => defect.defectId === model[0],
		);
		if (selectedRowInfo == null) {
			// defectIdを一意のIndexにしたテーブルのため本来は見つかるはず
			setSelectedDefect(undefined);
			setSelectedChipIndex(new Point(0, 0));
			return;
		}
		setSelectedDefect(selectedRowInfo);
		setSelectedChipIndex(
			new Point(selectedRowInfo.chipX, selectedRowInfo.chipY),
		);
	};

	/**
	 * DataGridPaginationリフレッシュ関数
	 * @param 無し
	 * @returns 無し
	 */
	const handleClickRefresh = (): void => {
		setDefect();
	};

	useEffect(() => {
		setDefect();
	}, [setDefect]);

	return (
		<Box sx={{ height: "100%" }}>
			<DataGridPro
				columns={columns}
				rows={defectList}
				slotProps={{
					row: {
						onContextMenu: handleContextMenu,
						style: { cursor: "context-menu" },
					},
				}}
				sx={{ height: "100%", border: 0 }}
				columnHeaderHeight={20}
				rowHeight={20}
				slots={{
					toolbar: () => DefectDataGridToolBar(columns),
					pagination: () =>
						DataGridPaginationWithRefreshButton({ handleClickRefresh }),
				}}
				localeText={sortToolTipText}
				disableColumnMenu
				disableMultipleRowSelection
				hideFooterSelectedRowCount
				disableVirtualization={DISABLE_VIRTULIZATION}
				getRowId={(row) => row.defectId}
				// ページ切り替え時にデータfetchする
				paginationMode="server"
				// データ総件数
				rowCount={total}
				pagination
				paginationModel={pagination}
				pageSizeOptions={[pagination.pageSize]}
				onPaginationModelChange={setPagination}
				// ソート条件指定時
				sortingMode="server"
				sortModel={sortModel}
				onSortModelChange={handleSortModelChange}
				// 列表示・非表示状態管理
				columnVisibilityModel={columnVisibilityModel}
				onColumnVisibilityModelChange={handleColumnVisibilityModelChange}
				// フィルタ条件指定時
				filterMode="server"
				// API抑止の中間状態を反映するために一時管理用state(filterManagement)を指定
				filterModel={filterManagement}
				rowSelectionModel={
					selectedDefect != null ? [selectedDefect.defectId] : []
				}
				onFilterModelChange={handleFilterModelChange}
				onRowSelectionModelChange={handleOnRowSelectionModelChange}
				apiRef={apiRef}
				initialState={{
					columns: {
						columnVisibilityModel: {
							src: false,
						},
					},
				}}
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
				<MenuItem onClick={openTestRun}>
					<ListItemIcon>
						<FactCheckIcon />
					</ListItemIcon>
					<ListItemText>Test Run</ListItemText>
				</MenuItem>
				<MenuItem onClick={openSFovView}>
					<ListItemIcon>
						<ImageIcon />
					</ListItemIcon>
					<ListItemText>sFOV View</ListItemText>
				</MenuItem>
			</Menu>
		</Box>
	);
};
