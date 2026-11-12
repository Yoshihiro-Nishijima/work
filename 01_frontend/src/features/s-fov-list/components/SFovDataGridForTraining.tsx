import FactCheckIcon from "@mui/icons-material/FactCheck";
import ImageIcon from "@mui/icons-material/Image";
import {
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	ThemeProvider,
	createTheme,
} from "@mui/material";
import { Box } from "@mui/system";
import {
	DataGridPro,
	type GridColDef,
	type GridColumnVisibilityModel,
	type GridFilterModel,
	type GridRowSelectionModel,
	type GridSortModel,
} from "@mui/x-data-grid-pro";
import { useAtomValue } from "jotai";
import { type MouseEvent, useEffect, useRef, useState } from "react";

import {
	DataGridPaginationWithRefreshButton,
	sortToolTipText,
} from "~/components/elements";
import { DISABLE_VIRTULIZATION } from "~/config";
import { useSFovViewModal } from "~/features/integrated-viewer-sfov-view/hooks/useSFovViewModal";
import { toSortParam } from "~/features/job-manager-info/types/converter";
import { useResultsRecord } from "~/features/misc/hooks/useResultName";
import {
	selectedSFovImageIdSetReadAtom,
	useSelectedSFovImageIdList,
} from "~/features/misc/hooks/useSelectedSFovImageIdList";
import { isFilterPending } from "~/features/misc/types/pagingQueryParam";
import { mmiTheme } from "~/routes";
import { useFovFilter } from "../hooks/useFovFilter";
import {
	useDefaultSelectedSFov,
	useFovList,
	useSetSFovList,
} from "../hooks/useFovList";
import type { Fov } from "../types";
import {
	SFOV_DATAGRID_FOOTER_HEIGHT,
	SFovDataGridForTrainingFooter,
} from "./SFovDataGridForTrainingFooter";
import { SFovDataGridForTrainingToolbar } from "./SFovDataGridForTrainingToolbar";

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

const sFovDataGridTheme = createTheme({
	...mmiTheme,
	components: {
		MuiDataGrid: {
			styleOverrides: {
				row: {
					"&.Mui-selected": {
						backgroundColor: "yellow",
						color: "black",
						"&:hover": {
							backgroundColor: "yellow",
						},
					},
				},
				root: mmiTheme.components?.MuiDataGrid?.styleOverrides?.root,
			},
		},
	},
});

interface SFovDataGridProps {
	height?: string;
	isGetResultsRecord?: boolean;
}
/**
 * SFovリストデータグリッド \
 * フッターにリフレッシュボタンあり
 * @param height データグリッド高さ default 100%
 * @param isGetResultsRecord リフレッシュボタン押下時にResultRecordも再取得するか否か default false
 * @returns SFovリストデータグリッド
 */
export const SFovDataGridForTraining = ({
	height = "100%",
	isGetResultsRecord = false,
}: SFovDataGridProps): JSX.Element => {
	const { fovList, total, pagination } = useFovList();
	const {
		setPagination,
		sort,
		setSort,
		columnVisibilityModel,
		setColumnVisibilityModel,
		setSelectedFovImageIdForTraining,
		setFetchedFovList,
		setSelectedFovImageId,
	} = useSetSFovList();
	const { hasSelectedSFov, initSelectedSFov } = useDefaultSelectedSFov();
	const { initFilterData, setGridFilterData, filter, filterManagement } =
		useFovFilter();
	const { updateSFovViewModalOpen } = useSFovViewModal();
	const selectedSFovImageIdList = useAtomValue(selectedSFovImageIdSetReadAtom);
	const { addById, remove } = useSelectedSFovImageIdList();
	const { refreshResultsRecord } = useResultsRecord();
	const [sortModel, setSortModel] = useState<GridSortModel | undefined>(
		undefined,
	);
	const [rowSelectionModel, setRowSelectionModel] =
		useState<GridRowSelectionModel>([]);

	const selectedSFovImageId = useRef(-1);

	const [contextMenu, setContextMenu] = useState<
		| {
				mouseX: number;
				mouseY: number;
				isSelected: boolean;
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
		// デフォルト選択(選択中があれば何もしない)
		if (hasSelectedSFov) return;
		initSelectedSFov(DEFAULT_SELECTED_FOV);
	}, [hasSelectedSFov, initSelectedSFov]);

	useEffect(() => {
		// Map画面の際にmFOVMapレベル・初期表示mFOV=1/sFOV=1とするためにDEFAULTで管理情報をsFOV選択状態とする
		// (TrainingMode画面では黄色枠表示のための選択状態は別管理の選択状態。
		// Map描画・制御などに使用するための情報設定用選択状態設定であり、統合Viewer画面ではリスト行の初期選択も
		// 兼ねているが、TrainingMode画面では別管理でMapおよびリスト行の選択状態を更新しているため影響なし。 ）
		setFetchedFovList();
	}, [setFetchedFovList]);

	// 外部からのsFov選択状態反映
	useEffect(() => {
		setRowSelectionModel([...selectedSFovImageIdList]);
	}, [selectedSFovImageIdList]);

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
		selectedSFovImageId.current = fovList[selectedIdx].imageid;
		setSelectedFovImageIdForTraining(fovList[selectedIdx].imageid);
		const isSelected = rowSelectionModel.includes(fovList[selectedIdx].imageid);
		setContextMenu(
			contextMenu == null
				? { mouseX: event.clientX - 2, mouseY: event.clientY - 4, isSelected }
				: undefined,
		);
	};

	const handleClose = (): void => {
		setContextMenu(undefined);
		selectedSFovImageId.current = -1;
	};

	const removeSelectedFov = (): void => {
		// sFOVリスト右クリックメニューのremove(選択解除)
		const removeImageIdList: number[] = [];
		const selectIndex = fovList.findIndex(
			(fov) => fov.imageid === selectedSFovImageId.current,
		);

		// クリック位置以前の対象検索
		for (let i = selectIndex; i >= 0; i--) {
			if (!rowSelectionModel.includes(fovList[i].imageid)) break;
			removeImageIdList.push(fovList[i].imageid);
		}
		// クリック位置より後の対象検索
		for (let i = selectIndex + 1; i < fovList.length; i++) {
			if (!rowSelectionModel.includes(fovList[i].imageid)) break;
			removeImageIdList.push(fovList[i].imageid);
		}

		for (const removeImageId of removeImageIdList) {
			setRowSelectionModel(
				rowSelectionModel.filter((rowSelect) => rowSelect !== removeImageId),
			);
		}
		remove(removeImageIdList);
		handleClose();
	};

	const openSFovView = (): void => {
		updateSFovViewModalOpen(true);
		handleClose();
	};

	const handleSortModelChange = (model: GridSortModel): void => {
		// ビュー切替時参照用兼内部管理用(Atomに格納。API受け渡しにも使用)
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
	 * 行選択時の処理
	 * @param model rowSelectionモデル（Grid上で選択した行のrowidリストがarray形式で入っている)
	 * @returns 無し
	 */
	const hadleOnRowSelectinModelChange = (
		model: GridRowSelectionModel,
	): void => {
		if (
			model.length === 1 &&
			rowSelectionModel.find((rowSelect) => rowSelect === model[0]) != null
		) {
			// 単純選択での削除(選択済み行の選択解除)
			setRowSelectionModel(
				rowSelectionModel.filter((rowSelect) => rowSelect !== model[0]),
			);
			remove(model.map(Number));
			return;
		}
		// 単純選択での追加、範囲選択
		setRowSelectionModel([...new Set([...rowSelectionModel, ...model])]);
		addById(model.map(Number));
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
		<Box sx={{ height: `calc(${height} - ${SFOV_DATAGRID_FOOTER_HEIGHT}px)` }}>
			<ThemeProvider theme={sFovDataGridTheme}>
				<DataGridPro
					columns={columns}
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
						toolbar: SFovDataGridForTrainingToolbar,
						pagination: () =>
							DataGridPaginationWithRefreshButton({ handleClickRefresh }),
					}}
					localeText={sortToolTipText}
					disableColumnMenu
					hideFooterSelectedRowCount
					disableVirtualization={DISABLE_VIRTULIZATION}
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
					onFilterModelChange={handleFilterModelChange}
					// 行選択時の処理
					getRowId={(row) => row.imageid}
					rowSelectionModel={rowSelectionModel}
					onRowSelectionModelChange={hadleOnRowSelectinModelChange}
					onRowClick={(row, event) => {
						if (event.ctrlKey) {
							// Ctrl+クリックでの複数選択操作無効
							event.defaultMuiPrevented = true;
						}
						setSelectedFovImageId(Number(row.id));
					}}
				/>
			</ThemeProvider>
			{contextMenu != null && (
				<Menu
					open={true}
					onClose={handleClose}
					anchorReference="anchorPosition"
					anchorPosition={{ top: contextMenu.mouseY, left: contextMenu.mouseX }}
					slotProps={{
						root: {
							onContextMenu: (e) => {
								e.preventDefault();
								handleClose();
							},
						},
					}}
				>
					<MenuItem
						onClick={removeSelectedFov}
						disabled={!contextMenu.isSelected}
					>
						<ListItemIcon>
							<FactCheckIcon />
						</ListItemIcon>
						<ListItemText>Remove</ListItemText>
					</MenuItem>
					<MenuItem onClick={openSFovView}>
						<ListItemIcon>
							<ImageIcon />
						</ListItemIcon>
						<ListItemText>sFOV View</ListItemText>
					</MenuItem>
				</Menu>
			)}
			<SFovDataGridForTrainingFooter />
		</Box>
	);
};
