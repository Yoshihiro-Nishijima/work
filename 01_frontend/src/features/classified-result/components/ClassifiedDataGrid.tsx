import { Box, type SxProps, type Theme } from "@mui/material";
import {
	DataGridPro,
	type GridColDef,
	type GridRowSelectionModel
} from "@mui/x-data-grid-pro";
import { PixiComponent } from "@pixi/react";
import { useAtom } from "jotai";
import { atomWithReset } from "jotai/utils";
import {
	type DisplayObject as PixiDisplayObject,
	Graphics as PixiGraphics,
} from "pixi.js";
import { useEffect, useMemo, useState } from "react";
import { WithSortableHeaderTooltip } from "~/components/elements/DataGrid/WithSortableHeaderTooltip";

import { CategorySymbolSvg } from "~/features/misc/utils/CategorySymbolSvg";
import { getCategoryDefinition } from "~/features/misc/utils/getCategoryDefinition";

const classifiedDefectList = [
	{
		id: -1,
		categoryNo: -1,
		total: 24000,
	},
	{
		id: 0,
		categoryNo: 0,
		total: 793,
	},
	{
		id: 1,
		categoryNo: 1,
		total: 421,
	},
	{
		id: 2,
		categoryNo: 2,
		total: 318,
	},
	{
		id: 3,
		categoryNo: 3,
		total: 245,
	},
	{
		id: 4,
		categoryNo: 4,
		total: 180,
	},
	{
		id: 5,
		categoryNo: 5,
		total: 142,
	},
	{
		id: 6,
		categoryNo: 6,
		total: 500,
	},
	{
		id: 7,
		categoryNo: 7,
		total: 20010,
	},
	{
		id: 8,
		categoryNo: 8,
		total: 52,
	},
	{
		id: 9,
		categoryNo: 9,
		total: 23,
	},
	{
		id: 10,
		categoryNo: 10,
		total: 8,
	},
];

interface ClassifiedHeightSize {
	sx?: SxProps<Theme>;
}
const getColumns = (): GridColDef[] => {
	return [
		{
			field: "categoryNo",
			headerName: "Cat No.",
			type: "number",
			width: 80,
			align: "right",
		},
		{
			field: "symbol",
			headerName: "記号",
			width: 60,
			sortable: false,
			align: "center",
			valueGetter: ({ row }) => {
				return row.categoryNo;
			},
			renderCell: (symbol) =>
				symbol.value >= 0
					? categorySymbolRenderer(symbol.value)
					: null,
		},
		{
			field: "categoryName",
			headerName: "Cat Name",
			type: "string",
			valueGetter: ({ row }) => {
				const category = getCategoryDefinition(row.categoryNo);
				return category.categoryName;
			},
		},
		{
			field: "total",
			headerName: "Total Num",
			type: "number",
			width: 100,
		},
	];
};

const categorySymbolRenderer = (categoryNo: number): JSX.Element => {
	const selectedDisplayArea = CategorySymbolSvg(getCategoryDefinition(categoryNo));

	return (
		<Box>
			<svg
				aria-hidden="true"
				viewBox="0 0 24 24"
				style={{ width: "1rem", height: "1rem" }}
			>
				{selectedDisplayArea}
			</svg>
		</Box>
	);
};

interface CategorySymbolProps {
	categoryNo: number;
}

interface useSelectedCategoryNoList {
	selectedCategoryNoList: number[];
	setSelectedCategoryNoList: (selectedCategoryNoList: number[]) => void;
}

const selectedCategoryNoListAtom = atomWithReset<number[]>([]);

export const useSelectedCategoryNoList = (): useSelectedCategoryNoList => {
	const [selectedCategoryNoList, setSelectedCategoryNoList] = useAtom(selectedCategoryNoListAtom);
	return { selectedCategoryNoList, setSelectedCategoryNoList };
}

const CategorySymbolComponent =
	PixiComponent<
		CategorySymbolProps,
		PixiDisplayObject
	>("CategorySymbol", {
		create: (_prop): PixiDisplayObject => {
			return new PixiGraphics() as PixiDisplayObject;
		},
		applyProps: (o, oldProps, props) => {
			const g = o as PixiGraphics;
			const centerX = 10;
			const centerY = 10;
			const radius = 5;

			g.clear();
			g.lineStyle(0, "red").beginFill("red");
			g.drawCircle(centerX, centerY, radius)
		},
	});

interface ClassifiedDataGridProp {
	height?: string;
}

export const ClassifiedDataGrid = ({
	height = "100%",
} : ClassifiedDataGridProp): JSX.Element => {
	const {
		selectedCategoryNoList,
		setSelectedCategoryNoList,
	} = useSelectedCategoryNoList();

	const baseColumns = useMemo(() => {
		return getColumns();
	}, []);
	const columns = useMemo(() => {
		return WithSortableHeaderTooltip(baseColumns);
	}, [baseColumns]);

	const handleOnRowSelectionModelChange = (
		model: GridRowSelectionModel,
	): void => {
		setSelectedCategoryNoList(model.filter((id): id is number => typeof id === "number"));
	};

	return (
		<Box sx={{ height, width: "100%" }}>
			<DataGridPro
				columns={columns}
				rows={classifiedDefectList}
				checkboxSelection
				disableRowSelectionOnClick
				disableColumnMenu
				hideFooter
				columnHeaderHeight={20}
				rowHeight={20}
				rowSelectionModel={selectedCategoryNoList}
				onRowSelectionModelChange={handleOnRowSelectionModelChange}
			/>
		</Box>
	);
};
