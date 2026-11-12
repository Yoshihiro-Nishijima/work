import FactCheckIcon from "@mui/icons-material/FactCheck";
import ImageIcon from "@mui/icons-material/Image";
import { ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import { Box } from "@mui/system";
import {
	DataGridPro,
	type GridColDef,
	type GridColumnVisibilityModel,
	type GridFilterModel,
	type GridSortModel,
} from "@mui/x-data-grid-pro";
import { Point } from "pixi.js";
import { type MouseEvent, useEffect, useMemo, useRef, useState } from "react";

import {
	ColumnAndFilterToolBar,
	DataGridPaginationWithRefreshButton,
	sortToolTipText,
} from "~/components/elements";
import { WithSortableHeaderTooltip } from "~/components/elements/DataGrid/WithSortableHeaderTooltip";
import { SizedContainer } from "~/components/elements/SizedContainer";
import {
	DISABLE_VIRTULIZATION,
	INTEGRATED_VIEWER_PATH,
	getTestRunURL,
} from "~/config";
import { useSFovViewModal } from "~/features/integrated-viewer-sfov-view/hooks/useSFovViewModal";
import { toSortParam } from "~/features/job-manager-info/types/converter";
import {
	useResultName,
	useResultsRecord,
} from "~/features/misc/hooks/useResultName";
import { useSelectedDefect } from "~/features/misc/hooks/useSelectedDefect";

import { isFilterPending } from "~/features/misc/types/pagingQueryParam";
import { startsWithPath } from "~/utils/urlUtils";
import { useFovFilter } from "../hooks/useFovFilter";
import {
	useDefaultSelectedSFov,
	useFovList,
	useSetSFovList,
} from "../hooks/useFovList";
import type { Fov } from "../types";

const isIntegratedViewerURL = startsWithPath(INTEGRATED_VIEWER_PATH);
const DEFAULT_SELECTED_FOV: Fov = {
	indexX: 0,
	indexY: 0,
	mfovno: 1,
	sfovno: 1,
	// これ以降は型を合わせるためのダミー情報
	imageid: 0,
	areano: 0,
	seqno: 0,
	coordX: 0,
	coordY: 0,
	defectNum: 0,
};

const columns: GridColDef[] = [
	{
		field: "imageid",
		headerName: "Image No",
		type: "number",
		width: 70,
		hideable: false,
	},
	{ field: "defectNum", headerName: "Defect Num", type: "number", width: 80 },
	{ field: "seqno", headerName: "Sequence", type: "number", width: 80 },
	{ field: "areano", headerName: "Area", type: "number", width: 60 },
	{ field: "mfovno", headerName: "mFOV No", type: "number", width: 60 },
	{ field: "sfovno", headerName: "sFOV No", type: "number", width: 60 },
	{ field: "indexX", headerName: "Chip X", type: "number", width: 70 },
	{ field: "indexY", headerName: "Chip Y", type: "number", width: 70 },
	{ field: "coordX", headerName: "Coord X", type: "number", width: 100 },
	{ field: "coordY", headerName: "Coord Y", type: "number", width: 100 },
];

interface SFovDataGridProps {
	height?: string;
	isGetResultsRecord?: boolean;
}
/**
 * SFovリストデータグリッド \
 * フッターにリフレッシュボタンあり
 * @param height データグリッド高さ default 100%
 * @param refreshResultsRecord リフレッシュボタン押下時にResultRecordも再取得するか否か default false
 * @returns SFovリストデータグリッド
 */
export const SFovDataGrid = ({
	height = "100%",
	isGetResultsRecord = false,
}: SFovDataGridProps): JSX.Element => {
	const { resultName } = useResultName();
	const { fovList, total, pagination, selectedFov } = useFovList();
	const {
		setPagination,
		sort,
		setSort,
		columnVisibilityModel,
		setColumnVisibilityModel,
		setSelectedFovImageId,
		setFetchedFovList,
	} = useSetSFovList();
	const { hasSelectedSFov, initSelectedSFov } = useDefaultSelectedSFov();

	const { initFilterData, setGridFilterData, filter, filterManagement } =
		useFovFilter();
	const { updateSFovViewModalOpen } = useSFovViewModal();
	const { selectedDefect, setSelectedDefect } = useSelectedDefect();
	const [sortModel, setSortModel] = useState<GridSortModel | undefined>(
		undefined,
	);
	const { refreshResultsRecord } = useResultsRecord();
	const selectedMFovNo = useRef(0);
	const selectedSFovNo = useRef(0);
	const tooltipColumns = useMemo(() => {
		return WithSortableHeaderTooltip(columns);
	}, []);

	const [contextMenu, setContextMenu] = useState<
		| {
				mouseX: number;
				mouseY: number;
		  }
		| undefined
	>(undefined);

	const [ready, isReady] = useState(false);
	useEffect(() => {
		isReady(true);
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: 初回(タブ切替後）のみ行う
	useEffect(() => {
		if (filter == null) return;
		initFilterData(columns);
	}, []);

	useEffect(() => {
		setFetchedFovList();
	}, [setFetchedFovList]);

	useEffect(() => {
		// デフォルト選択(選択中があれば何もしない)
		if (hasSelectedSFov) return;
		initSelectedSFov(isIntegratedViewerURL ? DEFAULT_SELECTED_FOV : undefined);
	}, [hasSelectedSFov, initSelectedSFov]);

	useEffect(() => {
		const sortModelWork: GridSortModel = [];
		for (const sortItem of sort) {
			sortModelWork.push({ field: sortItem.field, sort: sortItem.direction });
		}
		setSortModel(sortModelWork);
	}, [sort]);

	const handleContextMenu = (event: MouseEvent): void => {
		event.preventDefault();
		const selectedIdx = Number(
			event.currentTarget.getAttribute("data-rowindex"),
		);
		selectedMFovNo.current = fovList[selectedIdx].mfovno;
		selectedSFovNo.current = fovList[selectedIdx].sfovno;
		setSelectedFovImageId(fovList[selectedIdx].imageid);
		if (selectedDefect != null) setSelectedDefect(undefined);
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

	const handleSortModelChange = (model: GridSortModel): void => {
		// タブ切替時参照用兼内部管理用(Atomに格納。API受け渡しにも使用)
		setSort(toSortParam(model));
		// DataGrid設定
		setSortModel(model);
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

	const handleColumnVisibilityModelChange = (
		model: GridColumnVisibilityModel,
	): void => {
		setColumnVisibilityModel(model);
	};

	/**
	 * DataGridPaginationリフレッシュ関数
	 * @param 無し
	 * @returns 無し
	 */
	const handleClickRefresh = (): void => {
		setFetchedFovList();
		// defect countの更新も必要な場合
		if (isGetResultsRecord) refreshResultsRecord();
	};

	if (!ready) return <div>Loading...</div>;

	return (
		<Box sx={{ height, width: "100%" }}>
			<SizedContainer>
				<DataGridPro
					columns={tooltipColumns}
					rows={fovList}
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
						toolbar: ColumnAndFilterToolBar,
						pagination: () =>
							DataGridPaginationWithRefreshButton({ handleClickRefresh }),
					}}
					localeText={sortToolTipText}
					disableColumnMenu
					disableMultipleRowSelection
					hideFooterSelectedRowCount
					disableVirtualization={DISABLE_VIRTULIZATION}
					getRowId={(row) => row.imageid}
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
					// ColumnVisibility条件指定時(Filterと異なり画面内での"列表示・列非表示"切替)
					columnVisibilityModel={columnVisibilityModel}
					onColumnVisibilityModelChange={handleColumnVisibilityModelChange}
					// フィルタ条件指定時
					filterMode="server"
					filterModel={filterManagement}
					rowSelectionModel={selectedFov != null ? [selectedFov.imageid] : []}
					onFilterModelChange={handleFilterModelChange}
					onRowSelectionModelChange={(selectedRow) => {
						if (selectedRow.length === 0) return;
						setSelectedFovImageId(Number(selectedRow[0]));
						if (selectedDefect != null) setSelectedDefect(undefined);
					}}
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
				<MenuItem onClick={openTestRun}>
					<ListItemIcon>
						<FactCheckIcon />
					</ListItemIcon>
					<ListItemText>Test Run</ListItemText>
				</MenuItem>
				{isIntegratedViewerURL ? (
					<MenuItem onClick={openSFovView}>
						<ListItemIcon>
							<ImageIcon />
						</ListItemIcon>
						<ListItemText>sFOV View</ListItemText>
					</MenuItem>
				) : (
					<Box />
				)}
			</Menu>
		</Box>
	);
};
