import { Box } from "@mui/material";
import { DataGridPro, type GridFilterModel } from "@mui/x-data-grid-pro";
import { useAtomValue } from "jotai";
import { useEffect, useRef } from "react";

import { DataGridPaginationWithRefreshButton } from "~/components/elements";
import { isFilterPending } from "~/features/misc/types/pagingQueryParam";
import { categoryDefectClassAtom, useDefect } from "../hooks/useDefect";
import { useDefectFilter } from "../hooks/useDefectFilter";
import { useFixedSizeGridProp } from "../hooks/useFixedSizeGridProp";
import { ClippingDefectsGrid } from "./ClippingDefectsGrid";
import { DefectDataGridToolBar } from "./DefectDataGridToolBar";
import { useDefectViewColumns } from "./DefectViewColumns";

export const DefectDataGridThumbnail = (): JSX.Element => {
	const categoryDefectClass = useAtomValue(categoryDefectClassAtom);
	const panelRef = useRef<HTMLDivElement>(null);
	const {
		gridHeight,
		gridWidth,
		setColumnCount,
		setRowCount,
		setGridSize,
		dynamicColumnWidth,
		dynamicRowHeight,
	} = useFixedSizeGridProp();
	const { pagination, setPagination, total, setDefect } = useDefect({
		defectClass: categoryDefectClass,
	});
	const { setGridFilterData, filterManagement } = useDefectFilter();
	const columns = useDefectViewColumns();

	useEffect(() => {
		// エリア幅変更時のタイルレイアウト再計算
		const observer = new ResizeObserver((entries) => {
			for (const el of entries) {
				// ここでサイズ要素を取得できる
				if (
					gridWidth !== el.contentRect.width ||
					gridHeight !== el.contentRect.height
				) {
					setGridSize(el.contentRect.width, el.contentRect.height);
					// use dynamic sizes computed by child via hook
					setColumnCount(
						Math.trunc(Math.max(el.contentRect.width / dynamicColumnWidth, 1)),
					);
					setRowCount(
						Math.trunc(Math.max(el.contentRect.height / dynamicRowHeight, 1)),
					);
				}
			}
		});
		if (panelRef.current != null) {
			observer.observe(panelRef.current);
		}
		return () => {
			observer.disconnect();
		};
	}, [
		gridHeight,
		gridWidth,
		setColumnCount,
		setGridSize,
		setRowCount,
		dynamicColumnWidth,
		dynamicRowHeight,
	]);

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

	/**
	 * DataGridPaginationリフレッシュ関数
	 * @param 無し
	 * @returns 無し
	 */
	const handleClickRefresh = (): void => {
		setDefect();
	};

	useEffect(() => {
		setDefect();
	}, [setDefect]);

	return (
		<Box sx={{ height: "100%" }}>
			{/** ヘッダー(ツールバー) */}
			<DataGridPro
				columns={columns}
				rows={[]}
				slots={{
					toolbar: () => DefectDataGridToolBar(columns),
				}}
				disableColumnMenu
				disableMultipleRowSelection
				hideFooterSelectedRowCount
				// フィルタ条件指定時
				filterMode="server"
				// API抑止の中間状態を反映するために一時管理用state(filterManagement)を指定
				filterModel={filterManagement}
				onFilterModelChange={handleFilterModelChange}
				style={{ height: "47px" }}
			/>
			{/** データ部分 */}
			<div
				style={{ height: "calc(100% - 100px)", padding: "5px" }}
				ref={panelRef}
			>
				<ClippingDefectsGrid />
			</div>
			{/** フッター(ページネーション) */}
			<DataGridPro
				columns={[]}
				rows={[]}
				slots={{
					pagination: () =>
						DataGridPaginationWithRefreshButton({ handleClickRefresh }),
				}}
				disableColumnMenu
				disableMultipleRowSelection
				hideFooterSelectedRowCount
				// ページ切り替え時にデータfetchする
				paginationMode="server"
				// データ総件数
				rowCount={total}
				pagination
				paginationModel={pagination}
				pageSizeOptions={[pagination.pageSize]}
				onPaginationModelChange={setPagination}
				style={{ height: "47px" }}
			/>
		</Box>
	);
};
