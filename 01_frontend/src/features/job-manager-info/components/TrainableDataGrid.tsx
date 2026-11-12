import { Menu, MenuItem } from "@mui/material";
import type {
	GridColDef,
	GridFilterItem,
	GridFilterModel,
	GridRenderCellParams,
	GridRowSelectionModel,
} from "@mui/x-data-grid-pro";
import { DataGridPro } from "@mui/x-data-grid-pro";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
	ColumnAndFilterToolBar,
	modelStatusRenderer,
	sortToolTipText,
} from "~/components/elements";
import { WithSortableHeaderTooltip } from "~/components/elements/DataGrid/WithSortableHeaderTooltip";
import { DISABLE_VIRTULIZATION, getIntegratedViewerURL } from "~/config";
import {
	isFilterPending,
	toSQLFilter,
} from "~/features/misc/types/pagingQueryParam";
import { useSelectedModel } from "~/features/training-param-setting/hooks/useSelectedModel";
import { toLocalDateStr, toNumStr, toTimeStr } from "~/utils/formatter";

import { dateTimeWithSecondsOperators } from "~/components/elements/DataGrid/DateTimeSecondFilterOperator";
import { DeleteConfirmDialog } from "~/components/elements/DeleteConfirmDialog";
import { useDeleteTrainingModel } from "~/features/training-mode/hooks/useTrainingQueue";
import { useDataGridColumnOrder } from "~/lib/useDataGridColumnOrder";
import { getTrainingsFetch } from "../api/getTrainings";
import { useModelDataGridTabIdx } from "../hooks/useModelDataGridTabIdx";
import { useSearchResults } from "../hooks/useSearchResults";
import { useTrainableGridState } from "../hooks/useTrainableGridState";
import type { TrainableDataParam, TrainableModelData } from "../types";
import { toSortParam } from "../types";
import {
	convertProcessTimeFilterItem,
	processTimeFilterOperators,
} from "./ProcessTimeFilterOperator";

const columns: GridColDef[] = [
	{
		field: "status",
		headerName: "Status",
		width: 1,
		type: "singleSelect",
		valueOptions: [
			{ value: 2, label: "success" },
			{ value: 3, label: "error" },
			{ value: 4, label: "cancel" },
		],
		renderHeader: () => "",
		renderCell: (status: GridRenderCellParams) =>
			modelStatusRenderer(status.value),
	},
	{
		field: "executionDate",
		headerName: "Execution Date",
		width: 145,
		type: "dateTime",
		valueFormatter: ({ value }) => Boolean(value) && toLocalDateStr(value),
		hideable: false,
		filterOperators: dateTimeWithSecondsOperators({ allowSeconds: false }),
	},
	{
		field: "modelName",
		headerName: "Model Name",
		flex: 1,
		minWidth: 128,
	},
	{
		field: "processTime",
		headerName: "Process Time",
		width: 105,
		valueFormatter: ({ value }) => toTimeStr(value),
		filterOperators: processTimeFilterOperators,
	},
	{
		field: "error",
		headerName: "Error",
		flex: 1,
		minWidth: 128,
		sortable: false,
	},
	{
		field: "imageNum",
		headerName: "Images",
		align: "right",
		width: 82,
		type: "number",
		valueFormatter: ({ value }) => (value == null ? "" : toNumStr(value)),
	},
	{ field: "recipe", headerName: "Recipe", flex: 2, minWidth: 128 },
];

export interface TrainableModelKey {
	resultName: string;
	modelName: string;
	modelRowIndex: number;
}

export const TrainableDataGrid = (prop: TrainableDataParam): JSX.Element => {
	const {
		pagination: gridPagination,
		setPagination: setGridPagination,
		columnVisibilityModel,
		setColumnVisibilityModel,
		filterModel,
		setFilterModel,
		sort: gridSort,
		setSort: setGridSort,
	} = useTrainableGridState(prop.type);

	const {
		total,
		datalist,
		pagination,
		setPagination,
		setSort,
		setFilter,
		searchResultFetchData,
	} = useSearchResults<TrainableModelData>(
		getTrainingsFetch(prop),
		60000,
		toSortParam(gridSort),
		gridPagination,
		toSQLFilter(filterModel, columns),
	);
	const { orderedColumns, handleColumnOrderChange } = useDataGridColumnOrder(
		columns,
		`trainableDataGrid-${prop.type}`,
	);
	const tooltipColumns = useMemo(() => {
		return WithSortableHeaderTooltip(orderedColumns);
	}, [orderedColumns]);

	const { selectedModel, setSelectedModel } = useSelectedModel();
	const {
		setIsTrainingJobQueued,
		doDeleteTrainingModel,
		isDeleted,
		resetDeleted,
	} = useDeleteTrainingModel();
	const { trainingType } = useModelDataGridTabIdx();

	const [nextSelectModelRowIndex, setNextSelectModelRowIndex] = useState(-1);

	const resetNextSelectModelRowIndex = useCallback(() => {
		setNextSelectModelRowIndex(-1);
	}, []);

	const [contextMenu, setContextMenu] = useState<
		| {
				mouseX: number;
				mouseY: number;
		  }
		| undefined
	>(undefined);

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	const selectedKey = useRef<TrainableModelKey>();

	// ------------------------------
	// Pagination関連
	const handlePaginationModelChange = (model: {
		page: number;
		pageSize: number;
	}): void => {
		setGridPagination(model);
		setPagination(model);
	};

	useEffect(() => {
		// 選択済みModelが一覧に存在する
		if (
			selectedModel != null &&
			selectedModel.type === prop.type &&
			datalist.some((model) => model.modelName === selectedModel.modelName)
		) {
			return;
		}

		if (datalist.length === 0) {
			// Model一覧が0件
			if (selectedModel != null) {
				setSelectedModel(undefined);
			}
		} else {
			// 一覧がある場合は先頭行を選択
			// modelNameで比較して同じなら更新しない（オブジェクト参照が変わっても無駄な再レンダリングを防ぐ）
			if (selectedModel?.modelName !== datalist[0].modelName) {
				setSelectedModel(datalist[0]);
			}
		}
	}, [datalist, prop.type, selectedModel, setSelectedModel]);

	useEffect(() => {
		//モデル削除終了後の処理
		if (isDeleted == null) return;
		//削除成功時は再検索. 削除失敗時は状態のみリセット
		isDeleted ? searchResultFetchData() : resetNextSelectModelRowIndex();
		resetDeleted();
	}, [
		isDeleted,
		searchResultFetchData,
		resetNextSelectModelRowIndex,
		resetDeleted,
	]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: nextSelectTrainingModelRowIndex更新契機ではタイミングが早い(データ再取得後の更新としたい）ため監視対象外とする
	useEffect(() => {
		// 行削成功時の行選択処理
		// 選択行以外を削除した場合(選択行の選択状態を維持)
		if (nextSelectModelRowIndex < 0) return;

		// 選択行を削除した場合(更新後の行を選択)
		//  1)基本的には、(pageSize*page+削除前行index)をpageSizeで割った余りが選択行番号
		//  2)"(pageSize*page+削除前行index)"がtotalより大きい場合は最下行を選択
		//  3)削除前に残り１行であれば、選択解除
		const newSelectRowIndex =
			nextSelectModelRowIndex < total
				? nextSelectModelRowIndex % pagination.pageSize
				: (nextSelectModelRowIndex - 1) % pagination.pageSize;

		// 削除後にリストが空になった場合に選択解除
		if (newSelectRowIndex < 0) {
			setSelectedModel(undefined);
			resetNextSelectModelRowIndex();
			return;
		}

		// 削除後の行再選択
		// (2ページ目以降にて最後の1行が削除された際に、データリスト初期化・データリスト設定の
		// 2度更新されるため、データリスト更新後（データリストが1件以上存在する)タイミングで更新)
		if (datalist.length >= 1) {
			//指定されたIndex行を選択
			setSelectedModel(datalist[newSelectRowIndex]);
			resetNextSelectModelRowIndex();
		}
	}, [
		datalist,
		pagination.pageSize,
		resetNextSelectModelRowIndex,
		setSelectedModel,
	]);

	const filterConverterMap: Record<
		string,
		(item: GridFilterItem) => GridFilterItem
	> = {
		processTime: convertProcessTimeFilterItem,
	};

	const convertFilterModel = (model: GridFilterModel): GridFilterModel => {
		if (!isFilterPending(model)) {
			setPagination({ ...pagination, page: 0 });
		}
		const convertedItems = model.items.map((item) => {
			return filterConverterMap[item.field]?.(item) ?? item;
		});

		return { ...model, items: convertedItems };
	};

	const handleFilterModelChange = (model: GridFilterModel): void => {
		const convertedModel = convertFilterModel(model);
		setFilterModel(model);
		setFilter(toSQLFilter(convertedModel, columns));
	};

	const handleRowSelectionModelChange = (
		model: GridRowSelectionModel,
	): void => {
		if (model.length === 0) return;
		setSelectedModel(datalist.find((v) => v.modelName === model[0]));
		setIsTrainingJobQueued(false);
	};

	const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>): void => {
		event.preventDefault();
		const index = Number(event.currentTarget.getAttribute("data-rowindex"));
		selectedKey.current = {
			resultName: datalist[index].resultName,
			modelName: datalist[index].modelName,
			modelRowIndex: index,
		};
		setContextMenu(
			contextMenu == null
				? { mouseX: event.clientX - 2, mouseY: event.clientY - 4 }
				: undefined,
		);
	};

	const handleClose = (): void => {
		setContextMenu(undefined);
	};

	const handleClickOpenEdit = (): void => {
		openIntegratedViewer();
		handleClose();
	};

	const openIntegratedViewer = (): void => {
		if (selectedKey.current != null) {
			const params = new URLSearchParams();
			params.append("mode", "training");
			params.append("trainingType", prop.type);
			params.append("modelName", selectedKey.current.modelName);
			const url = new URL(
				getIntegratedViewerURL(selectedKey.current.resultName),
			);
			url.search = params.toString();
			window.open(url);
		}
	};

	const handleClickDelete = (): void => {
		if (!selectedKey.current?.modelName) return;
		handleClose();
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = (): void => {
		if (!selectedKey.current?.modelName) {
			return;
		}

		// 削除後に選択する行情報を計算して格納(選択行を削除する場合)
		if (selectedModel?.modelName === selectedKey.current.modelName) {
			setNextSelectModelRowIndex(
				pagination.pageSize * pagination.page +
					selectedKey.current.modelRowIndex,
			);
		}

		// Model削除API実行(ここで作成したテーブルを更新するために更新関数を渡す)
		doDeleteTrainingModel(trainingType, selectedKey.current.modelName);

		setDeleteDialogOpen(false);
	};

	const handleCancelDelete = (): void => {
		setDeleteDialogOpen(false);
	};

	return (
		<>
			<DataGridPro
				columns={tooltipColumns}
				rows={datalist}
				slotProps={{
					row: {
						onContextMenu: handleContextMenu,
						style: { cursor: "context-menu" },
					},
				}}
				sx={{ height: "100%", border: 0 }}
				columnHeaderHeight={40}
				rowHeight={40}
				slots={{ toolbar: ColumnAndFilterToolBar }}
				localeText={sortToolTipText}
				disableColumnMenu
				disableMultipleRowSelection
				hideFooterSelectedRowCount
				disableVirtualization={DISABLE_VIRTULIZATION}
				getRowId={(row) => row.modelName}
				// ページ切り替え時にデータfetchする
				paginationMode="server"
				// データ総件数
				rowCount={total}
				pagination
				paginationModel={gridPagination}
				pageSizeOptions={[gridPagination.pageSize]}
				onPaginationModelChange={handlePaginationModelChange}
				// ソート条件指定時
				sortingMode="server"
				sortModel={gridSort}
				onSortModelChange={(sorting) => {
					setGridSort(sorting);
					setSort(toSortParam(sorting));
				}}
				// フィルタ条件指定時
				filterMode="server"
				filterModel={filterModel}
				onFilterModelChange={handleFilterModelChange}
				// カラム表示/非表示
				columnVisibilityModel={columnVisibilityModel}
				onColumnVisibilityModelChange={setColumnVisibilityModel}
				onColumnOrderChange={handleColumnOrderChange}
				onRowSelectionModelChange={handleRowSelectionModelChange}
				rowSelectionModel={[selectedModel?.modelName ?? ""]}
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
				<MenuItem onClick={handleClickOpenEdit}>Edit</MenuItem>
				<MenuItem onClick={handleClickDelete}>Delete</MenuItem>
			</Menu>
			<DeleteConfirmDialog
				name={selectedKey.current?.modelName}
				isOpen={deleteDialogOpen}
				onConfirmDelete={handleConfirmDelete}
				onCancel={handleCancelDelete}
			/>
		</>
	);
};
