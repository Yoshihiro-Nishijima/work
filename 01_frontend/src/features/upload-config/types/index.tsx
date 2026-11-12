import type { GridRowModesModel, GridRowsProp } from "@mui/x-data-grid-pro";

export type KlarfVersion = "1.2" | "1.8";

export interface ServerRow {
	id: string;
	name: string;
	address: string;
	dir: string;
	isNew: boolean;
}

export interface Server {
	name: string;
	address: string;
	dir: string;
}

export interface UploadConfig {
	version: KlarfVersion;
	servers: Server[];
}

export interface EditToolbarProps {
	setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
	setRowModesModel: (
		newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
	) => void;
	disabled?: boolean;
}
