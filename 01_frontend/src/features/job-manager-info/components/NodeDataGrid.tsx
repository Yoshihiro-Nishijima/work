import { DataGridPro, type GridColDef } from "@mui/x-data-grid-pro";

import { DISABLE_VIRTULIZATION } from "~/config";

import { useDataGridColumnOrder } from "~/lib/useDataGridColumnOrder";
import { useNodeList } from "../hooks/useNodeList";
import { useSelectedJobInfo } from "../hooks/useSelectedJobInfo";

const columns: GridColDef[] = [
	{
		field: "name",
		headerName: "Name",
		flex: 1,
		minWidth: 128,
		sortable: false,
	},
	{
		field: "state",
		headerName: "State",
		flex: 1,
		minWidth: 128,
		sortable: false,
	},
	{
		field: "memoryGiB",
		headerName: "Memory Size [MB]",
		flex: 1,
		minWidth: 128,
		sortable: false,
	},
	{
		field: "cpus",
		headerName: "CPU Threads",
		flex: 1,
		minWidth: 128,
		sortable: false,
	},
];

export function NodeDataGrid(): JSX.Element {
	const { nodeList } = useNodeList();
	const { orderedColumns, handleColumnOrderChange } = useDataGridColumnOrder(
		columns,
		"nodeDataGrid",
	);

	const { selectedNodeJobName, setSelectedNodeJobName } = useSelectedJobInfo();
	return (
		<DataGridPro
			columns={orderedColumns}
			rows={nodeList}
			sx={{ height: "100%", border: 0 }}
			columnHeaderHeight={40}
			rowHeight={40}
			disableMultipleRowSelection
			hideFooterSelectedRowCount
			disableVirtualization={DISABLE_VIRTULIZATION}
			hideFooter
			getRowId={(row) => row.name}
			onRowSelectionModelChange={(selectedRowIdx) => {
				if (selectedRowIdx.length === 0) return;
				setSelectedNodeJobName(selectedRowIdx[0] as string);
			}}
			rowSelectionModel={[selectedNodeJobName]}
			onColumnOrderChange={handleColumnOrderChange}
			disableColumnMenu
		/>
	);
}
