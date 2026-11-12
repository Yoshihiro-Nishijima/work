import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import HelpIcon from "@mui/icons-material/Help";
import RemoveIcon from "@mui/icons-material/Remove";
import {
	Box,
	IconButton,
	List,
	ListItem,
	ListItemText,
	Stack,
	Tooltip,
	Typography,
	styled,
} from "@mui/material";
import {
	DataGridPro,
	type GridColDef,
	type GridRowClassNameParams,
} from "@mui/x-data-grid-pro";
import { toLocalDateStr } from "~/utils/formatter";
import { useCreateDatasetParam } from "../hooks/useCreateDatasetParam";
import { MAX_SOURCES, useSourceList } from "../hooks/useSourceList";
import type { Source } from "../types";

const TOOLTIP_PRIORITY_MESSAGE =
	"If result or dataset contains the same sample, the one above takes priority.";
const TOOLTIP_MAX_SOURCES_MESSAGE = `A maximum of ${MAX_SOURCES} data can be added.`;

// デフォルト列設定
const defaultColDef = {
	sortable: false,
	filterable: false,
	hideable: false,
};
const columns: GridColDef[] = [
	{ ...defaultColDef, field: "sourceType", headerName: "Source", width: 90 },
	{
		...defaultColDef,
		field: "date",
		headerName: "Date",
		width: 150,
		valueGetter: (params) => {
			if (params.row.sourceType === "Dataset") {
				return params.row.dataset.createdDate;
			}
			return params.row.result.executionDate;
		},
		valueFormatter: ({ value }) => Boolean(value) && toLocalDateStr(value),
	},
	{
		...defaultColDef,
		field: "name",
		headerName: "Name",
		width: 300,
		valueGetter: (params) => {
			if (params.row.sourceType === "Dataset") {
				return params.row.dataset.datasetName;
			}
			return params.row.result.recipe;
		},
	},
	{
		...defaultColDef,
		field: "type",
		headerName: "Type",
		width: 150,
		valueGetter: (params) => {
			if (params.row.sourceType === "Dataset") {
				return params.row.dataset.datasetType;
			}
			return params.row.result.jobType;
		},
	},
];

// DataGridの行の色をResult/Datasetで変える
const StyledDataGrid = styled(DataGridPro)(({ theme }) => ({
	"& .row-result": {
		color: theme.palette.primary.dark,
	},
	"& .row-dataset": {
		color: theme.palette.secondary.dark,
	},
}));

export const SourceDataGrid = (): JSX.Element => {
	const {
		moveUp,
		moveDown,
		removeSource,
		removeAll,
		selectedSource,
		setSelectedSource,
	} = useSourceList();
	const { sourceList } = useCreateDatasetParam();
	const selectedId = selectedSource?.id;

	const getRowClassName = (params: GridRowClassNameParams) => {
		const row = params.row as Source;
		return row.sourceType === "Dataset" ? "row-dataset" : "row-result";
	};

	return (
		<>
			<Stack spacing={2} height="100%">
				<Stack direction="row" justifyContent="space-between">
					<Typography variant="subtitle1">
						Source Result/Dataset List
					</Typography>

					<Tooltip
						title={
							<Box>
								<List sx={{ pl: 2, py: 0 }}>
									<ListItem sx={{ py: 0 }} disableGutters>
										<ListItemText
											primary={`${TOOLTIP_PRIORITY_MESSAGE}\r\n${TOOLTIP_MAX_SOURCES_MESSAGE}`}
											sx={{ whiteSpace: "pre-wrap" }}
										/>
									</ListItem>
								</List>
							</Box>
						}
						arrow
					>
						<IconButton data-testid="help-button">
							<HelpIcon />
						</IconButton>
					</Tooltip>
				</Stack>
				<Box sx={{ height: 220 }}>
					<StyledDataGrid
						columns={columns}
						rows={sourceList}
						columnHeaderHeight={25}
						rowHeight={25}
						getRowClassName={getRowClassName}
						hideFooter
						disableColumnMenu
						checkboxSelection={false}
						disableMultipleRowSelection
						onRowSelectionModelChange={(model) => {
							const ids = model as number[];
							const id = ids[0];
							if (id == null) {
								setSelectedSource(undefined);
								return;
							}
							setSelectedSource(
								sourceList.find((s) => s.id === id) || undefined,
							);
						}}
						rowSelectionModel={selectedId != null ? [selectedId] : []}
					/>
				</Box>

				<Stack direction="row" spacing={1} justifyContent={"center"}>
					<Tooltip title="Upper the priority of the selected item." arrow>
						<span>
							<IconButton
								data-testid="move-up-btn"
								onClick={moveUp}
								disabled={selectedId == null}
							>
								<ArrowUpwardIcon />
							</IconButton>
						</span>
					</Tooltip>
					<Tooltip title="Lower the priority of the selected item." arrow>
						<span>
							<IconButton
								data-testid="move-down-btn"
								onClick={moveDown}
								disabled={selectedId == null}
							>
								<ArrowDownwardIcon />
							</IconButton>
						</span>
					</Tooltip>
					<Tooltip title="Remove the selected item from the list." arrow>
						<span>
							<IconButton
								data-testid="remove-btn"
								onClick={removeSource}
								disabled={selectedId == null}
							>
								<RemoveIcon />
							</IconButton>
						</span>
					</Tooltip>
					<Tooltip title="Clear the list" arrow>
						<span>
							<IconButton
								data-testid="clear-btn"
								onClick={removeAll}
								disabled={sourceList.length === 0}
							>
								<DeleteForeverIcon />
							</IconButton>
						</span>
					</Tooltip>
				</Stack>
			</Stack>
		</>
	);
};
