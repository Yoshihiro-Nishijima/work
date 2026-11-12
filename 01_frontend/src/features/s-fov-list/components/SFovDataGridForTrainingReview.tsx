import { Box } from "@mui/system";
import {
	DataGridPro,
	type GridColDef,
	type GridPaginationModel,
	type GridRowSelectionModel,
	type GridSortModel,
} from "@mui/x-data-grid-pro";
import { useEffect, useState } from "react";

import { sortToolTipText } from "~/components/elements";
import { DISABLE_VIRTULIZATION } from "~/config";

import { useReviewSFov } from "~/features/training-mode-sfov-view/hooks/useReviewModal";
import {
	SFOV_DATAGRID_FOOTER_HEIGHT,
	SFovDataGridForTrainingFooter,
} from "./SFovDataGridForTrainingFooter";
import { SFovDataGridForTrainingReviewToolbar } from "./SFovDataGridForTrainingReviewToolbar";

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

// ページネーション(ページング処理はクライアント側で行うのでローカルで保持)
const PAGINATION = { pageSize: 10000, page: 0 };

interface SFovDataGridProps {
	height?: string;
	isGetResultsRecord?: boolean;
}
/**
 * TrainingMode Review用 SFovリストデータグリッド
 * @param height データグリッド高さ default 100%
 * @returns SFovリストデータグリッド
 */
export const SFovDataGridForTrainingReview = ({
	height = "100%",
}: SFovDataGridProps): JSX.Element => {
	const { rowSelectionModel, setShowingSFov, reviewFovList, setSortModel } =
		useReviewSFov();
	const [pagination, setPagination] = useState<GridPaginationModel>(PAGINATION);
	const [ready, isReady] = useState(false);
	useEffect(() => {
		isReady(true);
	}, []);

	/**
	 * 行選択時の処理
	 * @param model rowSelectionモデル（Grid上で選択した行のrowidリストがarray形式で入っている)
	 */
	const handleOnRowSelectingModelChange = (
		model: GridRowSelectionModel,
	): void => {
		setShowingSFov(reviewFovList.find((e) => e.imageid === model[0]));
	};

	/**
	 * ソート条件変更時の処理
	 * @param model ソートモデル
	 */
	const handleOnSortModelChange = (model: GridSortModel): void => {
		setSortModel(model);
	};

	if (!ready) return <div>Loading...</div>;

	return (
		<Box sx={{ height: `calc(${height} - ${SFOV_DATAGRID_FOOTER_HEIGHT}px)` }}>
			<DataGridPro
				columns={columns}
				rows={reviewFovList}
				sx={{ height: "100%", border: 0 }}
				columnHeaderHeight={20}
				rowHeight={20}
				slots={{
					toolbar: SFovDataGridForTrainingReviewToolbar,
				}}
				localeText={sortToolTipText}
				disableColumnMenu
				hideFooterSelectedRowCount
				disableVirtualization={DISABLE_VIRTULIZATION}
				// ページネーション
				pagination
				paginationModel={pagination}
				pageSizeOptions={[pagination.pageSize]}
				onPaginationModelChange={setPagination}
				// ソート (sFovViewの表示リストもソート適用が必要なのでフック側で一緒に行う)
				sortingMode="server"
				onSortModelChange={handleOnSortModelChange}
				// 行選択
				getRowId={(row) => row.imageid}
				rowSelectionModel={rowSelectionModel}
				onRowSelectionModelChange={handleOnRowSelectingModelChange}
				onRowClick={(_, event) => {
					if (event.ctrlKey) {
						// Ctrl+クリックでの複数選択操作無効
						event.defaultMuiPrevented = true;
					}
				}}
			/>
			<SFovDataGridForTrainingFooter />
		</Box>
	);
};
