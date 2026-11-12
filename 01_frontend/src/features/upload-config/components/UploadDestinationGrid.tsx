import CancelIcon from "@mui/icons-material/CancelOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import DoneIcon from "@mui/icons-material/Done";
import EditIcon from "@mui/icons-material/Edit";
import {
	DataGridPro,
	GridActionsCellItem,
	type GridColDef,
	GridColumnMenu,
	type GridColumnMenuProps,
	type GridEventListener,
	type GridPreProcessEditCellProps,
	GridRowEditStopReasons,
	type GridRowId,
	GridRowModes,
	type GridRowModesModel,
} from "@mui/x-data-grid-pro";
import React from "react";

import { Fieldset } from "~/components/layouts";

import { sortToolTipText } from "~/components/elements/DataGrid/SortButton";
import { WithSortableHeaderTooltip } from "~/components/elements/DataGrid/WithSortableHeaderTooltip";
import { FilteredTextEditCell } from "~/components/elements/FilteredTextEditCell";
import { DISABLE_VIRTULIZATION } from "~/config";
import { EditToolbar } from "../components/EditToolbar";
import {
	ALLOWED_IPV4_CHAR_REGEX,
	ALLOWED_PATH_CHAR_REGEX,
	ALLOWED_SERVER_NAME_CHAR_REGEX,
	isIPv4,
	isUnixPath,
	isWindowsPath,
} from "../hooks";
import type { ServerRow } from "../types";

interface UploadDestinationGridProps {
	rows: ServerRow[];
	setRows: React.Dispatch<React.SetStateAction<ServerRow[]>>;
}

export const MAX_DESTINATION_NUM = 20;

export const UploadDestinationGrid = (
	props: UploadDestinationGridProps,
): JSX.Element => {
	const { rows, setRows } = props;

	const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
		{},
	);

	const handleEditClick = (id: GridRowId) => () => {
		setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
	};

	const handleDoneClick = (id: GridRowId) => () => {
		setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
	};

	const handleDeleteClick = (id: GridRowId) => () => {
		setRows(rows.filter((row) => row.id !== id));
	};

	const handleCancelClick = (id: GridRowId) => () => {
		setRowModesModel({
			...rowModesModel,
			[id]: { mode: GridRowModes.View, ignoreModifications: true },
		});

		const editedRow = rows.find((row) => row.id === id);
		if (editedRow != null) {
			if (editedRow.isNew) {
				setRows(rows.filter((row) => row.id !== id));
			}
		}
	};

	const handleRowEditStop: GridEventListener<"rowEditStop"> = (
		params,
		event,
	) => {
		if (params.reason === GridRowEditStopReasons.rowFocusOut) {
			event.defaultMuiPrevented = true;
		}
	};

	const processRowUpdate = (
		newRow: ServerRow,
		_originalRow: ServerRow,
	): ServerRow => {
		const updatedRow = { ...newRow, isNew: false };
		setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
		return updatedRow;
	};

	const handleRowModesModelChange = (
		newRowModesModel: GridRowModesModel,
	): void => {
		setRowModesModel(newRowModesModel);
	};

	const columns: GridColDef[] = [
		{
			field: "name",
			headerName: "Name",
			width: 180,
			editable: true,
			renderEditCell: FilteredTextEditCell(ALLOWED_SERVER_NAME_CHAR_REGEX, 63),
			preProcessEditCellProps: (
				params: GridPreProcessEditCellProps<string>,
			) => {
				if (!params.props.value) {
					return { ...params.props, error: true };
				}
				// nameは重複不可
				const isDuplicate = rows.some(
					(row) => row.id !== params.id && row.name === params.props.value,
				);
				return { ...params.props, error: isDuplicate };
			},
		},
		{
			field: "address",
			headerName: "IP Address",
			width: 180,
			align: "left",
			headerAlign: "left",
			editable: true,
			renderEditCell: FilteredTextEditCell(ALLOWED_IPV4_CHAR_REGEX, 15),
			preProcessEditCellProps: (
				params: GridPreProcessEditCellProps<string>,
			) => {
				if (!params.props.value) {
					return { ...params.props, error: true };
				}
				const hasError = !isIPv4(params.props.value);
				return { ...params.props, error: hasError };
			},
		},
		{
			field: "dir",
			headerName: "Directory",
			width: 180,
			editable: true,
			renderEditCell: FilteredTextEditCell(ALLOWED_PATH_CHAR_REGEX, 260),
			preProcessEditCellProps: (
				params: GridPreProcessEditCellProps<string>,
			) => {
				if (!params.props.value) {
					return { ...params.props, error: true };
				}
				const hasError =
					!isWindowsPath(params.props.value) && !isUnixPath(params.props.value);
				return { ...params.props, error: hasError };
			},
		},
		{
			field: "actions",
			type: "actions",
			headerName: "Actions",
			width: 100,
			cellClassName: "actions",
			getActions: ({ id }) => {
				const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

				if (isInEditMode) {
					return [
						<GridActionsCellItem
							key="doneBtn"
							icon={<DoneIcon titleAccess="Done" />}
							label="Done"
							sx={{
								color: "primary.main",
							}}
							onClick={handleDoneClick(id)}
						/>,
						<GridActionsCellItem
							key="cancelBtn"
							icon={<CancelIcon titleAccess="Cancel" />}
							label="Cancel"
							className="textPrimary"
							onClick={handleCancelClick(id)}
							color="inherit"
						/>,
					];
				}

				return [
					<GridActionsCellItem
						key="editBtn"
						icon={<EditIcon titleAccess="Edit" />}
						label="Edit"
						className="textPrimary"
						onClick={handleEditClick(id)}
						color="inherit"
					/>,
					<GridActionsCellItem
						key="deleteBtn"
						icon={<DeleteIcon titleAccess="Delete" />}
						label="Delete"
						onClick={handleDeleteClick(id)}
						color="inherit"
					/>,
				];
			},
		},
	];
	const tooltipColumns = WithSortableHeaderTooltip(columns);

	/** ソートとフィルタのみ利用可能なカラムメニュー */
	const SortAndFilterColumnMenu = (props: GridColumnMenuProps): JSX.Element => {
		return (
			<GridColumnMenu
				{...props}
				slots={{
					columnMenuColumnsItem: null,
					columnMenuPinningItem: null,
				}}
			/>
		);
	};

	return (
		<Fieldset legend="Destination">
			<DataGridPro
				rows={rows}
				columns={tooltipColumns}
				editMode="row"
				rowModesModel={rowModesModel}
				onRowModesModelChange={handleRowModesModelChange}
				onRowEditStop={handleRowEditStop}
				processRowUpdate={processRowUpdate}
				disableVirtualization={DISABLE_VIRTULIZATION}
				localeText={sortToolTipText}
				hideFooter
				slots={{
					toolbar: EditToolbar,
					columnMenu: SortAndFilterColumnMenu,
				}}
				slotProps={{
					toolbar: {
						setRows,
						setRowModesModel,
						disabled: rows.length >= MAX_DESTINATION_NUM,
					},
				}}
				sx={{
					"& .MuiDataGrid-cell:has(.Mui-error)": {
						// Mui-errorクラス要素を持つMuiDataGrid-cellクラス要素
						backgroundColor: "error.main",
					},
				}}
			/>
		</Fieldset>
	);
};
