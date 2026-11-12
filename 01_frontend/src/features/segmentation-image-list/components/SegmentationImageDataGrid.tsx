import { Box } from "@mui/system";
import { DataGridPro, type GridColDef } from "@mui/x-data-grid-pro";

import { DISABLE_VIRTULIZATION } from "~/config";
import { useSegmentationImageList } from "../hooks/useSegmentationImageList";

const columns: GridColDef[] = [
	{
		field: "trainingImageNo",
		headerName: "Training Image No",
		type: "number",
		width: 180,
	},
];

export const SegmentationImageDataGrid = (): JSX.Element => {
	const {
		imageList,
		total,
		pagination,
		selectedFov,
		setPagination,
		setSelectedFovNo,
	} = useSegmentationImageList();

	return (
		<Box sx={{ height: "100%" }}>
			<DataGridPro
				columns={columns}
				rows={imageList}
				sx={{ height: "100%", border: 0 }}
				columnHeaderHeight={20}
				rowHeight={20}
				disableColumnMenu
				disableMultipleRowSelection
				disableVirtualization={DISABLE_VIRTULIZATION}
				hideFooterSelectedRowCount
				getRowId={(row) => row.trainingImageNo}
				// ページ切り替え時にデータfetchする
				paginationMode="server"
				// データ総件数
				rowCount={total}
				pagination
				paginationModel={pagination}
				pageSizeOptions={[pagination.pageSize]}
				onPaginationModelChange={setPagination}
				rowSelectionModel={
					selectedFov != null ? [selectedFov.trainingImageNo] : []
				}
				onRowSelectionModelChange={(selectedRow) => {
					// 行が選択された場合、selectedFovを更新する
					if (selectedRow.length === 0) return;
					setSelectedFovNo(Number(selectedRow[0]));
				}}
			/>
		</Box>
	);
};
