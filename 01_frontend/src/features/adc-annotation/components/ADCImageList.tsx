import { Box, ImageListItem, Typography } from "@mui/material";
import {
	type MutableRefObject,
	memo,
	useCallback,
	useEffect,
	useMemo,
	useRef,
} from "react";
import { FixedSizeGrid } from "react-window";
import { useFixedSizeGridProp } from "~/features/defect-list/hooks/useFixedSizeGridProp";
import { useClippingItem } from "../hooks/useClippingItem";
import { useDatasetDefect } from "../hooks/useDatasetDefect";
import { useEditCategories } from "../hooks/useEditCategories";
import { useSelectedDefect } from "../hooks/useSelectedDefect";
import {
	type FixedImgDataType,
	KEY_CATEGORY_MAP,
	UNSET_CATEGORY,
} from "../types";

const COLUMN_WIDTH = 160;
const COLUMN_HEIGHT = 190;
const CLIPPING_DEFECT_PIX_SIZE = 128;

type GridItemData = {
	clippingItem: FixedImgDataType[][];
	getIdByLinearIndex: (i: number) => number;
	computeLinearIndex: (
		data: FixedImgDataType[][],
		row: number,
		col: number,
	) => number;
	anchorRef: MutableRefObject<number | null>;
	selectOnly: (id: number) => void;
	addSelection: (ids: number[]) => void;
	removeSelection: (ids: number[]) => void;
	isSelected: (id: number) => boolean;
};

import type { GridChildComponentProps } from "react-window";
import { getAdaptiveTextColor } from "~/utils/colorUtils";

function CellRendererInner({
	columnIndex,
	rowIndex,
	style,
	data,
}: GridChildComponentProps<GridItemData>) {
	const cell = data.clippingItem[rowIndex][columnIndex];
	if (!cell) return null;

	const linearIndex =
		typeof cell.linearIndex === "number"
			? cell.linearIndex
			: data.computeLinearIndex(data.clippingItem, rowIndex, columnIndex);

	const { selectOnly, addSelection, removeSelection, isSelected } = data;

	const handleClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
		e.preventDefault();
		e.stopPropagation();

		const id = cell.id as number;

		if (e.ctrlKey || e.metaKey) {
			if (!isSelected(id)) {
				addSelection([id]);
			} else {
				removeSelection([id]);
			}
			return;
		}

		if (e.shiftKey) {
			const anchor = data.anchorRef.current;
			if (anchor == null) {
				data.anchorRef.current = linearIndex;
				addSelection([id]);
			} else {
				if (linearIndex === anchor) return;
				const idsToSelect: number[] = [];
				if (anchor < linearIndex) {
					for (let i = anchor + 1; i <= linearIndex; i++) {
						const selectId = data.getIdByLinearIndex(i);
						if (selectId !== -1) idsToSelect.push(selectId);
					}
				} else {
					for (let i = anchor - 1; i >= linearIndex; i--) {
						const selectId = data.getIdByLinearIndex(i);
						if (selectId !== -1) idsToSelect.push(selectId);
					}
				}
				addSelection(idsToSelect);
			}
			return;
		}

		selectOnly(cell.id);
		data.anchorRef.current = linearIndex;
	};

	// 選択不可テキスト選択防止スタイル
	const cellStyle = {
		...style,
		userSelect: "none" as const,
		WebkitUserSelect: "none" as const,
		MozUserSelect: "none" as const,
		msUserSelect: "none" as const,
	};

	// コントラスト比が4.5以上のものを取得(彩度を落としてグレー系で取得)
	const textColor = getAdaptiveTextColor(cell.imgbackgroundcolor);

	return (
		<div
			style={cellStyle}
			onClick={handleClick}
			id={`${rowIndex},${columnIndex}`}
			aria-pressed={isSelected(cell.id) ? "true" : "false"}
		>
			<ImageListItem
				key={cell.id}
				style={{
					outline: cell.outline,
					backgroundColor: cell.imgbackgroundcolor,
					userSelect: "none",
					WebkitUserSelect: "none",
				}}
				sx={{ margin: "8px", userSelect: "none" }}
			>
				<div>
					<img
						src={`${cell.img}?w=128&h=128&fit=crop&auto=format`}
						srcSet={`${cell.img}?w=128&h=128&fit=crop&auto=format`}
						width={CLIPPING_DEFECT_PIX_SIZE}
						height={CLIPPING_DEFECT_PIX_SIZE}
						alt={`Defect ${cell.id}`}
						style={{
							marginLeft: 8,
							marginTop: 8,
							pointerEvents: "none",
							userSelect: "none",
						}}
						loading="lazy"
						decoding="async"
					/>
					<Typography
						variant="subtitle1"
						mr={1}
						ml={1}
						sx={{
							userSelect: "none",
							color: textColor,
						}}
					>
						{cell.id}
					</Typography>
				</div>
			</ImageListItem>
		</div>
	);
}

const CellRenderer = memo(CellRendererInner);

// memo コンポーネントは MemoExoticComponent 型になるため、そのまま
// react-window の期待する ComponentType として扱えないことがある。
// そこで memo 化したコンポーネントをラップする軽量な関数コンポーネントを用意し、
// 明示的に正しい型を与えて FixedSizeGrid に渡す。
const CellRendererWrapper: React.ComponentType<
	GridChildComponentProps<GridItemData>
> = (props) => <CellRenderer {...props} />;

export const ADCImageList = (): JSX.Element => {
	const panelRef = useRef<HTMLDivElement>(null);
	const gridRef = useRef<FixedSizeGrid>(null);
	const {
		columnCount,
		gridWidth,
		gridHeight,
		setColumnCount,
		setRowCount,
		setGridSize,
	} = useFixedSizeGridProp();
	const {
		clippingItem,
		getIdByLinearIndex,
		getLinearIndexById,
		getLastLinearIndex,
		getRowColFromLinearIndex,
		computeLinearIndex,
	} = useClippingItem();
	const { defectList } = useDatasetDefect();
	const {
		selectOnly,
		addSelection,
		removeSelection,
		isSelected,
		clearSelection,
		selectedDefects,
	} = useSelectedDefect();
	const { updateSelectedCategories, removeSelectedCategories } =
		useEditCategories();

	const anchorRef = useRef<number | null>(null);

	const isEmpty =
		!clippingItem ||
		clippingItem.length === 0 ||
		clippingItem.every((row) => row.length === 0);

	const isInteractiveTarget = useCallback((el: HTMLElement | null): boolean => {
		if (!el) return false;
		const tag = el.tagName;
		return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
	}, []);

	// データフェッチ時に選択状態クリア
	// biome-ignore lint/correctness/useExhaustiveDependencies: defectList の変化時だけ発火させるため
	useEffect(() => {
		clearSelection();
		anchorRef.current = null;
	}, [defectList, clearSelection]);

	const hasSelection = useCallback(
		() => selectedDefects && selectedDefects.length > 0,
		[selectedDefects],
	);

	// 選択を更新してスクロール
	const updateSelection = useCallback(
		(fromLinearIndex: number, toLinearIndex?: number): boolean => {
			if (toLinearIndex == null) {
				// 単一選択
				const targetId = getIdByLinearIndex(fromLinearIndex);
				if (targetId === -1) return false;

				selectOnly(targetId);
				anchorRef.current = fromLinearIndex;

				// 選択したアイテムへスクロール
				if (gridRef.current) {
					const position = getRowColFromLinearIndex(fromLinearIndex);
					if (position) {
						gridRef.current.scrollToItem({
							rowIndex: position.row,
							columnIndex: position.col,
							align: "auto",
						});
					}
				}
			} else {
				// 範囲選択
				const idsToSelect: number[] = [];
				if (fromLinearIndex < toLinearIndex) {
					for (let i = fromLinearIndex; i <= toLinearIndex; i++) {
						const id = getIdByLinearIndex(i);
						if (id !== -1) idsToSelect.push(id);
					}
				} else {
					for (let i = fromLinearIndex; i >= toLinearIndex; i--) {
						const id = getIdByLinearIndex(i);
						if (id !== -1) idsToSelect.push(id);
					}
				}

				if (idsToSelect.length === 0) return false;
				addSelection(idsToSelect);
				anchorRef.current = toLinearIndex;

				// 選択したアイテムへスクロール
				if (gridRef.current) {
					const position = getRowColFromLinearIndex(toLinearIndex);
					if (position) {
						gridRef.current.scrollToItem({
							rowIndex: position.row,
							columnIndex: position.col,
							align: "auto",
						});
					}
				}
			}

			return true;
		},
		[getIdByLinearIndex, selectOnly, addSelection, getRowColFromLinearIndex],
	);

	// 矢印キー 選択アイテムを移動
	const handleArrowKey = useCallback(
		(e: KeyboardEvent) => {
			if (isEmpty || selectedDefects.length === 0) return false;

			const currentId = selectedDefects[selectedDefects.length - 1];
			let targetLinearIndex: number | null = null;

			// 現在の選択アイテムの位置を取得
			const currentLinearIndex = getLinearIndexById(currentId);

			if (currentLinearIndex === -1) return false;

			// 矢印キーに応じた移動先を計算
			switch (e.key) {
				// 1行上を選択
				case "ArrowUp":
					targetLinearIndex = currentLinearIndex - columnCount;
					break;
				// 1行下を選択
				case "ArrowDown":
					targetLinearIndex = currentLinearIndex + columnCount;
					break;
				// 1つ左を選択
				case "ArrowLeft":
					targetLinearIndex = currentLinearIndex - 1;
					break;
				// 1つ右を選択
				case "ArrowRight":
					targetLinearIndex = currentLinearIndex + 1;
					break;
				default:
					return false;
			}

			if (e.shiftKey) {
				// Shiftキーが押されている場合は範囲選択
				return updateSelection(currentLinearIndex, targetLinearIndex);
			}

			return updateSelection(targetLinearIndex);
		},
		[
			isEmpty,
			selectedDefects,
			getLinearIndexById,
			columnCount,
			updateSelection,
		],
	);

	// Homeキー DefectThumbnailの先頭のアイテムを選択
	const handleHomeKey = useCallback(
		(e: KeyboardEvent) => {
			if (isEmpty) return false;

			const firstLinearIndex = 0;

			// Shiftキーが押されている場合は範囲選択
			if (e.shiftKey && selectedDefects.length !== 0) {
				const currentId = selectedDefects[selectedDefects.length - 1];
				const currentLinearIndex = getLinearIndexById(currentId);
				if (currentLinearIndex === -1) return false;
				return updateSelection(currentLinearIndex, firstLinearIndex);
			}
			return updateSelection(firstLinearIndex);
		},
		[isEmpty, selectedDefects, getLinearIndexById, updateSelection],
	);

	// Endキー DefectThumbnailの末尾のアイテムを選択
	const handleEndKey = useCallback(
		(e: KeyboardEvent) => {
			if (isEmpty) return false;

			// 最後のアイテムを取得
			const lastLinearIndex = getLastLinearIndex();
			if (lastLinearIndex === -1) return false;

			// Shiftキーが押されている場合は範囲選択
			if (e.shiftKey && selectedDefects.length !== 0) {
				const currentId = selectedDefects[selectedDefects.length - 1];
				const currentLinearIndex = getLinearIndexById(currentId);
				if (currentLinearIndex === -1) return false;
				return updateSelection(currentLinearIndex, lastLinearIndex);
			}
			return updateSelection(lastLinearIndex);
		},
		[
			isEmpty,
			updateSelection,
			selectedDefects,
			getLinearIndexById,
			getLastLinearIndex,
		],
	);

	const handleNumberKey = useCallback(
		(e: KeyboardEvent) => {
			if (!(e.key in KEY_CATEGORY_MAP)) return false;
			if (!hasSelection()) return false;
			const category = KEY_CATEGORY_MAP[e.key as keyof typeof KEY_CATEGORY_MAP];
			updateSelectedCategories(category);
			return true;
		},
		[updateSelectedCategories, hasSelection],
	);

	const handleEscapeKey = useCallback(
		(_e: KeyboardEvent) => {
			if (!hasSelection()) return false;
			removeSelectedCategories();
			anchorRef.current = null;
			return true;
		},
		[removeSelectedCategories, hasSelection],
	);

	const handleDeleteKey = useCallback(
		(_e: KeyboardEvent) => {
			if (!hasSelection()) return false;
			updateSelectedCategories(UNSET_CATEGORY);
			return true;
		},
		[updateSelectedCategories, hasSelection],
	);

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement | null;
			if (isInteractiveTarget(target)) return;
			let handled = false;

			switch (e.key) {
				case "0":
				case "1":
				case "2":
				case "3":
				case "4":
				case "5":
				case "6":
				case "7":
				case "8":
				case "9":
					handled = handleNumberKey(e) || handled;
					break;
				case "Escape":
					handled = handleEscapeKey(e) || handled;
					break;
				case "Delete":
				case "Backspace":
					handled = handleDeleteKey(e) || handled;
					break;
				case "ArrowUp":
				case "ArrowDown":
				case "ArrowLeft":
				case "ArrowRight":
					handled = handleArrowKey(e) || handled;
					break;
				case "Home":
					handled = handleHomeKey(e) || handled;
					break;
				case "End":
					handled = handleEndKey(e) || handled;
					break;
				default:
					break;
			}

			if (handled) {
				e.preventDefault();
				e.stopPropagation();
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [
		handleNumberKey,
		handleEscapeKey,
		handleDeleteKey,
		handleArrowKey,
		handleHomeKey,
		handleEndKey,
		isInteractiveTarget,
	]);

	useEffect(() => {
		const el = panelRef.current;
		if (!el) return;
		const observer = new ResizeObserver(([entry]) => {
			const { width, height } = entry.contentRect;
			// 0 の更新は無視
			if (width === 0 || height === 0) return;
			let precedingHeight = 0;
			try {
				let sib = el.previousElementSibling as HTMLElement | null;
				while (sib) {
					const r = sib.getBoundingClientRect();
					precedingHeight += r.height;
					sib = sib.previousElementSibling as HTMLElement | null;
				}
			} catch (_err) {
				precedingHeight = 0;
			}
			const availableHeight = Math.max(0, height - precedingHeight);
			setGridSize(width, availableHeight);
			setColumnCount(Math.trunc(Math.max(width / COLUMN_WIDTH, 1)));
			setRowCount(Math.trunc(Math.max(availableHeight / COLUMN_HEIGHT, 1)));
		});
		observer.observe(el);
		return () => observer.disconnect();
	}, [setGridSize, setColumnCount, setRowCount]);

	// clippingItemが空の場合はNo dataと表示
	const emptyDisplay = (
		<div
			style={{
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				fontSize: "0.75rem",
			}}
		>
			<span>No data</span>
		</div>
	);

	const itemData = useMemo<GridItemData>(
		() => ({
			clippingItem,
			getIdByLinearIndex,
			computeLinearIndex,
			anchorRef,
			selectOnly,
			addSelection,
			removeSelection,
			isSelected,
		}),
		[
			clippingItem,
			getIdByLinearIndex,
			computeLinearIndex,
			selectOnly,
			addSelection,
			removeSelection,
			isSelected,
		],
	);
	return (
		<Box
			ref={panelRef}
			id="adc-image-list-root"
			sx={{
				height: "100%",
				p: 2,
			}}
			onClick={() => {
				clearSelection();
				anchorRef.current = null;
			}}
		>
			{isEmpty ? (
				emptyDisplay
			) : (
				<FixedSizeGrid
					ref={gridRef}
					columnCount={columnCount}
					columnWidth={COLUMN_WIDTH}
					height={gridHeight}
					width={gridWidth}
					rowCount={clippingItem.length}
					rowHeight={COLUMN_HEIGHT}
					itemData={itemData}
					overscanRowCount={2}
					overscanColumnCount={1}
				>
					{/* 画像一覧表示 */}
					{CellRendererWrapper}
				</FixedSizeGrid>
			)}
		</Box>
	);
};
