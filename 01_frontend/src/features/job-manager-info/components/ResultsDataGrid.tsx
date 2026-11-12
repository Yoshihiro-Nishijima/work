import {
	Box,
	DialogContent,
	DialogContentText,
	List,
	ListItemText,
	Menu,
	MenuItem,
} from "@mui/material";
import {
	DataGridPro,
	type GridColDef,
	type GridFilterItem,
	type GridFilterModel,
	type GridRenderCellParams,
	type GridRowSelectionModel,
	getGridSingleSelectOperators,
} from "@mui/x-data-grid-pro";
import ky from "ky";
import { type MouseEvent, useEffect, useMemo, useRef, useState } from "react";

import {
	ColumnAndFilterToolBar,
	deleteLockRenderer,
	reExecutedRenderer,
	resultStatusRenderer,
	sortToolTipText,
} from "~/components/elements";
import { ConfirmDialog } from "~/components/elements/ConfirmDialog";
import { dateTimeWithSecondsOperators } from "~/components/elements/DataGrid/DateTimeSecondFilterOperator";
import { WithSortableHeaderTooltip } from "~/components/elements/DataGrid/WithSortableHeaderTooltip";
import {
	convertSizeFilterItem,
	sizeFilterOperators,
} from "~/components/elements/SizeFilterOperator";
import { SizedContainer } from "~/components/elements/SizedContainer";
import { Toast } from "~/components/elements/Toast";
import {
	DISABLE_VIRTULIZATION,
	getIntegratedViewerURL,
	getResultViewerURL,
} from "~/config";
import {
	isFilterPending,
	toSQLFilter,
} from "~/features/misc/types/pagingQueryParam";
import { JobTypeList } from "~/features/recipe/types";
import { useDataGridColumnOrder } from "~/lib/useDataGridColumnOrder";
import {
	toLocalDateStr,
	toNumStr,
	toSizeStr,
	toTimeStr,
} from "~/utils/formatter";
import { getResults } from "../api/getResults";
import { reupload } from "../api/re-upload";
import { useDeleteResult } from "../hooks/useDeleteResult";
import { useResultsGridState } from "../hooks/useResultsGridState";
import { useSearchResults } from "../hooks/useSearchResults";
import { useSelectedJobInfo } from "../hooks/useSelectedJobInfo";
import { type Result, ResultStatus } from "../types";
import { toSortParam } from "../types/converter";
import {
	convertProcessTimeFilterItem,
	processTimeFilterOperators,
} from "./ProcessTimeFilterOperator";
import { ReUploadToasts } from "./ReUploadToasts";

function isADCDisabled(jobType: string | undefined): boolean {
	switch (jobType) {
		case "Trainable D2DB":
		case "Trainable D2D":
		case "D2D":
		case "C2C":
			return false;
		default:
			return true;
	}
}

const columns: GridColDef[] = [
	{
		field: "status",
		headerName: "Status",
		width: 1,
		type: "singleSelect",
		valueOptions: [
			{ value: ResultStatus.SUCCESS, label: "success" },
			{ value: ResultStatus.ERROR, label: "error" },
			{ value: ResultStatus.WARN, label: "warn" },
		],
		renderHeader: () => "",
		renderCell: (status: GridRenderCellParams) =>
			resultStatusRenderer(status.value),
	},
	{
		field: "isLocked",
		headerName: "Locked",
		width: 1,
		type: "singleSelect",
		valueOptions: [
			{ value: 0, label: "false" },
			{ value: 1, label: "true" },
		],
		filterOperators: getGridSingleSelectOperators().filter(
			(operator) => operator.value === "is",
		),
		renderHeader: () => "",
		renderCell: (isLocked: GridRenderCellParams) =>
			deleteLockRenderer(isLocked.value),
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
		field: "jobType",
		headerName: "Job Type",
		width: 115,
		type: "singleSelect",
		valueOptions: [...JobTypeList],
	},
	{
		field: "processTime",
		headerName: "Process Time",
		width: 105,
		valueFormatter: ({ value }) => toTimeStr(value),
		filterOperators: processTimeFilterOperators,
	},
	{
		field: "reExecuted",
		headerName: "Re-executed",
		width: 96,
		type: "singleSelect",
		valueOptions: [
			{ value: 0, label: "false" },
			{ value: 1, label: "true" },
		],
		filterOperators: getGridSingleSelectOperators().filter(
			(operator) => operator.value === "is",
		),
		renderCell: (executed: GridRenderCellParams) =>
			reExecutedRenderer(executed.value),
	},
	{
		field: "imageNum",
		headerName: "Images",
		align: "right",
		width: 82,
		type: "number",
		valueFormatter: ({ value }) => (value == null ? "" : toNumStr(value)),
	},
	{
		field: "diskSize",
		headerName: "DiskSize",
		flex: 3,
		minWidth: 128,
		valueFormatter: ({ value }) => toSizeStr(value),
		filterOperators: sizeFilterOperators,
	},
	{ field: "class", headerName: "Class", flex: 1, minWidth: 128 },
	{ field: "recipe", headerName: "Recipe", flex: 2, minWidth: 128 },
	{ field: "comment", headerName: "Comment", flex: 1, minWidth: 128 },
	{ field: "idw", headerName: "IDW", flex: 1, minWidth: 128 },
	{ field: "idp", headerName: "IDP", flex: 1, minWidth: 128 },
	{ field: "port", headerName: "Port", align: "center", width: 70 },
	{
		field: "slotNo",
		headerName: "Slot",
		align: "center",
		width: 70,
		type: "number",
	},
	{ field: "lotID", headerName: "Lot ID", flex: 1, minWidth: 128 },
	{ field: "processID", headerName: "Process ID", flex: 1, minWidth: 128 },
	{ field: "operator", headerName: "Operator" },
	{ field: "name", headerName: "Name", flex: 3, minWidth: 128 },
	{ field: "error", headerName: "Error", flex: 3, minWidth: 128 },
];

export const openADCAnnotation = (resultName: string): void => {
	const win = window.open();
	if (win == null) return;

	win.document.head.innerHTML =
		"<style>.mask{position:fixed;background:black;opacity:0.8;display:flex;justify-content:center;align-items:center;top:0;left:0;width:100%;height:100%;z-index:1000}.loading-circle{display:inline;width:150px;height:150px;border-radius:50%;border:10px solid rgba(255, 255, 255, 0.5);border-top-color:rgba(255, 255, 255, 1);animation:rotate 1s linear infinite}.loading-text{position:absolute;color:white;font-size:16pt}@keyframes rotate{to{transform:rotate(360deg)}}</style>";
	win.document.body.innerHTML =
		'<div class="mask"><span class="loading-circle"></span><span class="loading-text">Preparing...</span></div>';
	win.document.title = "MB-MMI - ADC";

	ky.post("/api/adc", { body: resultName, timeout: 3_600_000 })
		.text()
		.then((id) => {
			win.location.replace(`/adc/${id}?sort_ascending=on`);
		})
		.catch((error: Error) => {
			win.document.body.innerHTML = `<dialog style="background-color:lightcoral;border:none;border-radius:5px;top:5%;" open>${error.toString()}</dialog>`;
		});
};

const TOAST_TOP_MARGIN = 30;

const filterConverterMap: Record<
	string,
	(item: GridFilterItem) => GridFilterItem
> = {
	processTime: convertProcessTimeFilterItem,
	diskSize: convertSizeFilterItem,
};
const convertFilterModel = (model: GridFilterModel): GridFilterModel => {
	return {
		...model,
		items: model.items.map((item) => {
			return filterConverterMap[item.field]?.(item) ?? item;
		}),
	};
};

export function ResultsDataGrid(): JSX.Element {
	const {
		pagination: gridPagination,
		setPagination: setGridPagination,
		columnVisibilityModel,
		setColumnVisibilityModel,
		filterModel,
		setFilterModel,
		sort: gridSort,
		setSort: setGridSort,
	} = useResultsGridState();
	const {
		total,
		datalist,
		pagination,
		setPagination,
		setSort,
		setFilter,
		searchResultFetchData,
	} = useSearchResults<Result>(
		getResults,
		undefined,
		toSortParam(gridSort),
		gridPagination,
		toSQLFilter(convertFilterModel(filterModel), columns),
	);
	const { orderedColumns, handleColumnOrderChange } = useDataGridColumnOrder(
		columns,
		"resultsDataGrid",
	);
	const tooltipColumns = useMemo(() => {
		return WithSortableHeaderTooltip(orderedColumns);
	}, [orderedColumns]);
	const { selectedResultsJobName, setSelectedResultsJobName } =
		useSelectedJobInfo();
	const selectedName = useRef<string>();

	// ------------------------------
	// Pagination関連
	const handlePaginationModelChange = (model: {
		page: number;
		pageSize: number;
	}): void => {
		setGridPagination(model);
		setPagination(model);
	};

	// ------------------------------
	// 行選択関連
	const [rowSelectionModel, setRowSelectionModel] =
		useState<GridRowSelectionModel>([]);

	const hadleOnRowSelectinModelChange = (
		model: GridRowSelectionModel,
	): void => {
		if (model.length === 0) {
			setSelectedResultsJobName("");
			setRowSelectionModel([]);
			return;
		}
		setRowSelectionModel(model);

		// Recipe表示対象は最初に選択した行のもの
		const newName = model[0] as string;
		if (newName === selectedResultsJobName) return;
		setSelectedResultsJobName(newName);
	};

	// ------------------------------
	// コンテキストメニュー関連
	const [contextTarget, setContextTarget] = useState<string[]>([]);
	const isSingleTarget = contextTarget.length === 1;
	const [contextMenu, setContextMenu] = useState<
		| {
				jobType: string;
				mouseX: number;
				mouseY: number;
		  }
		| undefined
	>(undefined);

	const adcDisabled = isADCDisabled(contextMenu?.jobType);

	const handleContextMenu = (event: MouseEvent): void => {
		event.preventDefault();

		const { name, jobType } =
			datalist[Number(event.currentTarget.getAttribute("data-rowindex"))];

		selectedName.current = name;

		// 複数選択中のResultが対象か否かでコンテキストメニュー内容を変える
		if (rowSelectionModel.length > 1 && rowSelectionModel.includes(name)) {
			setContextTarget(rowSelectionModel.map(String));
		} else {
			setContextTarget([name]);
		}

		setContextMenu(
			contextMenu == null
				? { jobType, mouseX: event.clientX - 2, mouseY: event.clientY - 4 }
				: undefined,
		);
	};

	useEffect(() => {
		if (datalist.length === 0) {
			setSelectedResultsJobName("");
			return;
		}

		if (selectedResultsJobName.length === 0) {
			setSelectedResultsJobName(datalist[0].name);
			setRowSelectionModel([datalist[0].name]);
		}
	}, [datalist, selectedResultsJobName, setSelectedResultsJobName]);

	const handleClose = (): void => {
		setContextMenu(undefined);
		selectedName.current = "";
	};

	const openResultViewer = (): void => {
		selectedName.current != null &&
			window.open(getResultViewerURL(selectedName.current));
		handleClose();
	};

	const openIntegratedViewer = (): void => {
		selectedName.current != null &&
			window.open(getIntegratedViewerURL(selectedName.current));
		handleClose();
	};

	const openADCAnnotationCall = (): void => {
		selectedName.current != null && openADCAnnotation(selectedName.current);
		handleClose();
	};

	const openADCResultView = (): void => {
		if (selectedName.current != null) {
			window.open(`/adc/results/${selectedName.current}`);
		}
		handleClose();
	};

	// ------------------------------
	// ReUpload操作関連
	const [successOpen, setSuccessOpen] = useState(false);
	const [startedOpen, setStartedOpen] = useState(false);
	const [failureOpen, setFailureOpen] = useState(false);
	const [failureText, setFailureText] = useState("");
	const reupload0clicked = (): void => {
		reuploadClicked(0);
	};
	const reupload1clicked = (): void => {
		reuploadClicked(1);
	};
	const reuploadClicked = (index: number): void => {
		if (selectedName.current == null) return;
		setSuccessOpen(false);
		setFailureOpen(false);
		setStartedOpen(true);

		const resultName = selectedName.current;
		handleClose();

		const controller = new AbortController();
		reupload({ resultName, index }, controller.signal)
			.then((res) => {
				setStartedOpen(false);
				if (res === "") {
					setSuccessOpen(true);
				} else {
					setFailureText(res);
					setFailureOpen(true);
				}
			})
			.catch(() => {
				setFailureText("failed to execute re-upload");
				setFailureOpen(true);
			});
	};

	// ------------------------------
	// フィルタ関連
	const handleFilterModelChange = (model: GridFilterModel): void => {
		if (!isFilterPending(model)) {
			setPagination({ ...pagination, page: 0 });
		}
		setFilterModel(model);
		setFilter(toSQLFilter(convertFilterModel(model), columns));
	};

	// ------------------------------
	// 削除操作関連
	const {
		lockResult: lockResults,
		unlockResult: unlockResults,
		checkLastResults,
		deleteResults,
	} = useDeleteResult();

	// ロック判定はisSingleTargetの場合しか使わない
	const isLocked =
		isSingleTarget &&
		datalist
			.filter((row) => row.name === contextTarget[0])
			.every((row) => row.isLocked > 0);

	// Lockメニュー選択時の処理
	const handleClickLock = async (): Promise<void> => {
		handleClose();
		if (contextTarget.length !== 1) return;
		const err = isLocked
			? await unlockResults(contextTarget[0])
			: await lockResults(contextTarget[0]);
		if (err) {
			setDeleteErrorMessage(err);
			setDeleteToastOpen(true);
		} else {
			// APIが成功したので表示中のデータに即時反映
			searchResultFetchData();
		}
	};
	const [deleteToastOpen, setDeleteToastOpen] = useState(false);
	const [deleteErrorMessage, setDeleteErrorMessage] = useState<
		string | undefined
	>(undefined);
	const toastTrigger = {
		isOpen: deleteToastOpen,
		onClose: () => {
			setDeleteErrorMessage(undefined);
			setDeleteToastOpen(false);
		},
	};

	const [nextSelectAbsoluteIndex, setNextSelectAbsoluteIndex] = useState(-1);

	// biome-ignore lint/correctness/useExhaustiveDependencies: 削除後の行選択処理のみを目的としているため、datalist以外は監視対象外とする
	useEffect(() => {
		// 選択行以外を削除した場合、選択行の選択状態を維持
		if (nextSelectAbsoluteIndex < 0) return;

		// 選択行を削除した場合
		// 1) 削除後にインデックスが有効の場合、絶対インデックスをpageSizeで割った余り
		// 2) 削除後にインデックスが範囲外の場合、最下行を選択
		const newSelectRowIndex =
			nextSelectAbsoluteIndex < total
				? nextSelectAbsoluteIndex % pagination.pageSize
				: (nextSelectAbsoluteIndex - 1) % pagination.pageSize;

		// 削除後にリストが空になった場合に選択解除
		if (newSelectRowIndex < 0) {
			setSelectedResultsJobName("");
			setNextSelectAbsoluteIndex(-1);
			setRowSelectionModel([]);
			return;
		}

		// 削除後の行再選択
		// (2ページ目以降にて最後の1行が削除された際に、データリスト初期化・データリスト設定の
		// 2度更新されるため、データリスト更新後(データリストが1件以上存在する)タイミングで更新)
		if (datalist.length >= 1) {
			//指定されたIndex行を選択
			setSelectedResultsJobName(datalist[newSelectRowIndex].name);
			setRowSelectionModel([datalist[newSelectRowIndex].name]);
			setNextSelectAbsoluteIndex(-1);
		}
	}, [datalist]);

	// Menu(Popover)のPaper要素の実寸を測るためのref
	const menuPaperRef = useRef<HTMLDivElement>(null);
	const [displayPosition, setDisplayPosition] = useState({
		top: "0px",
		left: "0px",
	});

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deleteToolData, setDeleteToolData] = useState<string[]>([]);

	const handleClickDelete = async (): Promise<void> => {
		if (contextTarget.length === 0) return;
		handleClose();

		// ToolDataも削除するか確認
		const toolDatas = await checkLastResults(contextTarget);
		// 何もなし
		if (toolDatas == null) return;

		// エラー発生
		if (typeof toolDatas === "string") {
			setDeleteErrorMessage(toolDatas);
			setDeleteToastOpen(true);
			return;
		}

		// 選択行を削除する場合、最後の選択行の絶対インデックスを格納
		if (rowSelectionModel.includes(contextTarget[0])) {
			setNextSelectAbsoluteIndex(
				pagination.pageSize * pagination.page +
					datalist.findIndex(
						(row) => row.name === contextTarget[contextTarget.length - 1],
					),
			);
		}

		// ToolDataあり
		if (toolDatas.length > 0) {
			setDeleteToolData(toolDatas);
			setDeleteDialogOpen(true);
			return;
		}

		// 削除API呼び出し
		const err = await deleteResults(contextTarget);
		if (err) {
			setDeleteErrorMessage(err);
			setDeleteToastOpen(true);
			return;
		}
		setDeleteToastOpen(true);
		searchResultFetchData();
	};

	const handleConfirmDelete = async (): Promise<void> => {
		setDeleteDialogOpen(false);
		if (contextTarget.length === 0) return;

		// 削除API呼び出し
		const err = await deleteResults(contextTarget);
		if (err) {
			setDeleteErrorMessage(err);
			setDeleteToastOpen(true);
			return;
		}
		setDeleteToastOpen(true);
		searchResultFetchData();
	};

	const handleCancelDelete = (): void => {
		setDeleteDialogOpen(false);
	};

	return (
		<>
			<Box
				sx={{
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
				}}
			>
				<SizedContainer>
					<DataGridPro
						columns={tooltipColumns}
						rows={datalist}
						slotProps={{
							row: {
								onContextMenu: handleContextMenu,
								style: { cursor: "context-menu" },
							},
						}}
						sx={{ height: "100%", border: 0, flex: 1, minWidth: 0 }}
						columnHeaderHeight={40}
						rowHeight={40}
						slots={{ toolbar: ColumnAndFilterToolBar }}
						localeText={sortToolTipText}
						disableColumnMenu
						hideFooterSelectedRowCount
						disableVirtualization={DISABLE_VIRTULIZATION}
						getRowId={(row) => row.name}
						paginationMode="server"
						rowCount={total}
						pagination
						paginationModel={gridPagination}
						pageSizeOptions={[gridPagination.pageSize]}
						onPaginationModelChange={handlePaginationModelChange}
						sortingMode="server"
						sortModel={gridSort}
						onSortModelChange={(sorting) => {
							setGridSort(sorting);
							setSort(toSortParam(sorting));
						}}
						filterMode="server"
						filterModel={filterModel}
						onFilterModelChange={handleFilterModelChange}
						// カラム表示/非表示
						columnVisibilityModel={columnVisibilityModel}
						onColumnVisibilityModelChange={setColumnVisibilityModel}
						onColumnOrderChange={handleColumnOrderChange}
						rowSelectionModel={useMemo(
							() => rowSelectionModel,
							[rowSelectionModel],
						)}
						onRowSelectionModelChange={hadleOnRowSelectinModelChange}
					/>
				</SizedContainer>
			</Box>
			<Menu
				open={contextMenu != null}
				onClose={handleClose}
				anchorReference="anchorPosition"
				anchorPosition={
					contextMenu != null
						? { top: contextMenu.mouseY, left: contextMenu.mouseX }
						: undefined
				}
				TransitionProps={{
					onEntered: () => {
						const rect = menuPaperRef.current?.getBoundingClientRect();
						setDisplayPosition({
							top: `${(rect?.top ?? contextMenu?.mouseY ?? 0) + TOAST_TOP_MARGIN}px`,
							left: `${rect?.left ?? contextMenu?.mouseX ?? 0}px`,
						});
					},
				}}
				slotProps={{
					root: {
						onContextMenu: (e) => {
							e.preventDefault();
							handleClose();
						},
					},
					paper: { ref: menuPaperRef },
				}}
			>
				{/* MenuItemは Fragmentでまとめて指定することができないので1つずつ指定する */}
				{isSingleTarget && (
					<MenuItem onClick={openIntegratedViewer}>Integrated Viewer</MenuItem>
				)}
				{isSingleTarget && (
					<MenuItem onClick={openResultViewer}>Result Viewer</MenuItem>
				)}
				{isSingleTarget && (
					<MenuItem onClick={openADCAnnotationCall} disabled={adcDisabled}>
						ADC - Annotation
					</MenuItem>
				)}
				{isSingleTarget && (
					<MenuItem onClick={openADCResultView} disabled={adcDisabled}>
						ADC - Result View
					</MenuItem>
				)}
				{isSingleTarget && (
					<MenuItem onClick={reupload0clicked}>Re-upload 1</MenuItem>
				)}
				{isSingleTarget && (
					<MenuItem onClick={reupload1clicked}>Re-upload 2</MenuItem>
				)}
				<MenuItem
					onClick={handleClickDelete}
					disabled={isSingleTarget && isLocked}
				>
					Delete
				</MenuItem>
				{isSingleTarget && (
					<MenuItem onClick={() => handleClickLock()}>
						{isLocked ? "Unlock" : "Lock"}
					</MenuItem>
				)}
			</Menu>
			<ReUploadToasts
				startedOpened={startedOpen}
				setStartedOpened={setStartedOpen}
				successOpened={successOpen}
				setSuccessOpened={setSuccessOpen}
				failureOpened={failureOpen}
				setFailureOpened={setFailureOpen}
				failureText={failureText}
			/>
			<ConfirmDialog
				isOpen={deleteDialogOpen}
				onConfirm={handleConfirmDelete}
				onCancel={handleCancelDelete}
				okLabel="Delete Both"
				dialogContent={
					<DialogContent>
						We will delete both the Result data and the Tool data. <br />
						Please confirm that you wish to proceed with deleting both.
						{deleteToolData.length > 0 && (
							<List>
								{deleteToolData.map((td) => (
									<ListItemText key={td}>
										<DialogContentText>{td}</DialogContentText>
									</ListItemText>
								))}
							</List>
						)}
					</DialogContent>
				}
			/>
			<Toast
				message={deleteErrorMessage ?? "Delete succeeded."}
				trigger={toastTrigger}
				anchorOrigin={{ vertical: "top", horizontal: "left" }}
				severity={deleteErrorMessage ? "error" : "success"}
				displayPosition={displayPosition}
			/>
		</>
	);
}
