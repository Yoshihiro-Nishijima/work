import FactCheckIcon from "@mui/icons-material/FactCheck";
import ImageIcon from "@mui/icons-material/Image";
import {
	Box,
	ImageListItem,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Typography,
} from "@mui/material";
import { Point } from "pixi.js";
import {
	memo,
	useCallback,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { FixedSizeGrid } from "react-window";

import { getTestRunURL } from "~/config";
import { useDefectDisplay } from "~/features/display-setting/hooks/useDefectDisplay";
import { useSFovViewModal } from "~/features/integrated-viewer-sfov-view/hooks/useSFovViewModal";
import { useMapSelectionStatus } from "~/features/misc/hooks/useMapSelectionStatus";
import { useResultName } from "~/features/misc/hooks/useResultName";
import { useSelectedDefect } from "~/features/misc/hooks/useSelectedDefect";

import { useClippingItem } from "../hooks/useClippingItem";
import { useDefect } from "../hooks/useDefect";
import { useDefectFilter } from "../hooks/useDefectFilter";
import { useFixedSizeGridProp } from "../hooks/useFixedSizeGridProp";
import type { DefectWithDynamicFields, FixedDataType } from "../types";
import { formatClassName } from "../utils/defectFormatters";
import { useDefectViewColumns } from "./DefectViewColumns";

const COLUMN_WIDTH = 170;
// 固定画像サイズ
const IMAGE_SIZE = 128;
// 画像のpadding (8px * 2)
const IMAGE_PADDING = 16;
const IMAGE_AREA = IMAGE_SIZE + IMAGE_PADDING;
// テキスト1行の高さ
const TEXT_LINE_HEIGHT = 24;
// ID と Abnormality の固定2行
const FIXED_TEXT_LINES = 2;
// ImageListItem の margin (8px * 2)
const MARGIN = 16;

export const ClippingDefectsGrid = (): JSX.Element => {
	const { resultName } = useResultName();
	const { clippingItem } = useClippingItem();
	const {
		columnCount,
		gridWidth,
		gridHeight,
		setDynamicColumnWidth,
		setDynamicRowHeight,
	} = useFixedSizeGridProp();
	const { defectList } = useDefect();
	const { setSelectedDefect } = useSelectedDefect();
	const { updateSFovViewModalOpen } = useSFovViewModal();
	const { setSelectedChipIndex } = useMapSelectionStatus();
	const { filterManagement } = useDefectFilter();
	const { formatCaughtBy } = useDefectDisplay();
	const columns = useDefectViewColumns();

	const selectedMFovNo = useRef(0);
	const selectedSFovNo = useRef(0);

	const [contextMenu, setContextMenu] = useState<
		| {
				mouseX: number;
				mouseY: number;
		  }
		| undefined
	>(undefined);

	// defectId, abnormalityを除くフィルタ指定フィールドリスト(重複なし)
	const filterFieldList = useMemo(() => {
		if (!filterManagement?.items?.length) {
			return [];
		}
		return Array.from(
			new Set(
				filterManagement.items
					.filter(
						(item) =>
							!!item.field &&
							item.field !== "defectId" &&
							item.field !== "abnormality",
					)
					.map((item) => item.field),
			),
		);
	}, [filterManagement?.items]);

	/** DefectデータのMapオブジェクトを生成して効率化 (key: value形式の文字列辞書) */
	const defectMap = useMemo(() => {
		return new Map<number, Record<string, string>>(
			defectList.map((defect) => {
				const defectData = defect as DefectWithDynamicFields;
				const formattedData: Record<string, string> = {};

				// 各フィールドを "フィールド名: 値" 形式に変換
				for (const [key, value] of Object.entries(defectData)) {
					if (key === "caughtBy") {
						// caughtBy はフックの変換関数を使用
						formattedData[key] = formatCaughtBy(value as number);
					} else if (Array.isArray(value)) {
						// 配列は ", " で結合
						formattedData[key] = value
							.map((v) => (v == null ? "" : String(v)))
							.join(", ");
					} else {
						// その他は文字列化
						formattedData[key] = value == null ? "" : String(value);
					}
				}

				// defectClassName は仮想フィールド (共通変換関数を使用)
				formattedData.defectClassName = formatClassName(defectData.defectClass);

				return [defect.defectId, formattedData];
			}),
		);
	}, [defectList, formatCaughtBy]);

	/** フィールド名から表示名への変換Mapを生成 */
	const fieldNameMap = useMemo(() => {
		return new Map(columns.map((col) => [col.field, col.headerName]));
	}, [columns]);

	/** 動的に行の高さを計算（画像 + 固定テキスト + フィルタフィールド + マージン） */
	const dynamicRowHeight = useMemo(() => {
		const filterTextArea =
			(filterFieldList.length + FIXED_TEXT_LINES) * TEXT_LINE_HEIGHT;
		return IMAGE_AREA + filterTextArea + MARGIN;
	}, [filterFieldList.length]);

	// keep shared hook in sync (only when value changes)
	useLayoutEffect(() => {
		setDynamicRowHeight(dynamicRowHeight);
	}, [dynamicRowHeight, setDynamicRowHeight]);

	/** 最大文字列長に基づいて列幅を動的に計算 */
	const dynamicColumnWidth = useMemo(() => {
		if (filterFieldList.length === 0) {
			return COLUMN_WIDTH;
		}

		let maxLength = 0;

		// フィルタフィールドの表示名と値の最大文字列長を計算
		for (const field of filterFieldList) {
			const headerName = fieldNameMap.get(field) ?? field;

			// 各defectのフィールド値の最大長を計算
			for (const [, defect] of defectMap) {
				const value = defect[field] ?? "";
				const displayText = `${headerName} : ${value}`;
				maxLength = Math.max(maxLength, displayText.length);
			}
		}

		// 1文字あたり約8pxとして計算（padding考慮して+32px）
		const calculatedWidth = Math.max(COLUMN_WIDTH, maxLength * 8 + 32);
		// 最大幅を400pxに制限（必要に応じて調整可能）
		return Math.min(calculatedWidth, 400);
	}, [filterFieldList, fieldNameMap, defectMap]);

	useLayoutEffect(() => {
		setDynamicColumnWidth(dynamicColumnWidth);
	}, [dynamicColumnWidth, setDynamicColumnWidth]);

	const handleContextMenu = useCallback(
		(event: React.MouseEvent<HTMLDivElement>): void => {
			event.preventDefault();
			const fovNos = event.currentTarget.id.split(",");
			const selectedRowIdx = Number(fovNos[0]);
			const selectedColIdx = Number(fovNos[1]);

			selectedMFovNo.current =
				clippingItem[selectedRowIdx][selectedColIdx].mFOVNo;
			selectedSFovNo.current =
				clippingItem[selectedRowIdx][selectedColIdx].sFOVNo;
			setSelectedChipIndex(
				new Point(
					clippingItem[selectedRowIdx][selectedColIdx].chipX,
					clippingItem[selectedRowIdx][selectedColIdx].chipY,
				),
			);
			// functional update を使い contextMenu を依存から外す
			setContextMenu((prev) =>
				prev == null
					? { mouseX: event.clientX - 2, mouseY: event.clientY - 4 }
					: undefined,
			);
		},
		[clippingItem, setSelectedChipIndex],
	);

	const handleClose = useCallback((): void => {
		setContextMenu(undefined);
		selectedMFovNo.current = 0;
		selectedSFovNo.current = 0;
	}, []);

	const handleChange = useCallback(
		(index: number): void => {
			setSelectedDefect(defectList[index]);
			setSelectedChipIndex(
				new Point(defectList[index].chipX, defectList[index].chipY),
			);
		},
		[defectList, setSelectedChipIndex, setSelectedDefect],
	);

	const openTestRun = useCallback((): void => {
		if (selectedMFovNo.current !== 0 && selectedSFovNo.current !== 0) {
			window.open(
				getTestRunURL(
					resultName,
					selectedMFovNo.current,
					selectedSFovNo.current,
				),
				"Test Run",
			);
		}
		handleClose();
	}, [resultName, handleClose]);

	const openSFovView = useCallback((): void => {
		updateSFovViewModalOpen(true);
		handleClose();
	}, [updateSFovViewModalOpen, handleClose]);

	/** FixedSizeGrid に渡すレンダラを memoize */
	const RenderItemComponent = memo(function RenderItemComponent(
		d: FixedDataType,
	): JSX.Element | undefined {
		// Defectリストリサイズ時の React再レンダリングでデータがundefinedになるケースがあるのでチェック
		// react-window 側のバグの可能性あり
		const row = d.data?.[d.rowIndex];
		if (!row) return undefined;
		const cell = row[d.columnIndex];
		if (!cell) return undefined;
		return (
			<div
				style={d.style}
				onClick={() => {
					handleChange(cell.No);
				}}
				onContextMenu={handleContextMenu}
				id={`${d.rowIndex},${d.columnIndex}`}
			>
				<ImageListItem
					key={cell.id}
					// 選択色設定
					sx={{
						border: cell.imgborder,
						borderColor: cell.imgbordercolor,
						margin: "8px",
					}}
				>
					{/* 画像表示 */}
					<div>
						<div
							style={{
								display: "flex",
								justifyContent: "center",
								padding: "8px",
							}}
						>
							<img
								src={`${cell.img}?w=128&h=128&fit=crop&auto=format`}
								srcSet={`${cell.img}?w=128&h=128&fit=crop&auto=format`}
								alt={String(cell.id)}
								style={{
									width: `${IMAGE_SIZE}px`,
									height: `${IMAGE_SIZE}px`,
									objectFit: "contain",
								}}
								loading="lazy"
							/>
						</div>
						<Typography mr={1} ml={1}>
							ID : {cell.id}
						</Typography>
						<Typography mr={1} ml={1}>
							Abnormality : {cell.abnormality}
						</Typography>
						{filterFieldList.map((field) => {
							const defectId = cell.id;
							const defect = defectMap.get(defectId);
							if (!defect) return null;
							return (
								<Typography key={`${defectId}-${field}`} mr={1} ml={1}>
									{fieldNameMap.get(field) ?? field} : {defect[field] ?? ""}
								</Typography>
							);
						})}
					</div>
				</ImageListItem>
			</div>
		);
	});

	// clippingItemが空の場合はNo dataと表示（hooks は既に呼ばれているので安全）
	if (
		!clippingItem ||
		clippingItem.length === 0 ||
		clippingItem.every((row) => row.length === 0)
	) {
		return (
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
	}

	return (
		<Box>
			<FixedSizeGrid
				columnCount={columnCount}
				columnWidth={dynamicColumnWidth}
				height={gridHeight}
				width={gridWidth}
				rowCount={clippingItem.length}
				rowHeight={dynamicRowHeight}
				itemData={clippingItem}
			>
				{/* 画像一覧表示 */}
				{RenderItemComponent}
			</FixedSizeGrid>
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
				<MenuItem onClick={openTestRun}>
					<ListItemIcon>
						<FactCheckIcon />
					</ListItemIcon>
					<ListItemText>Test Run</ListItemText>
				</MenuItem>
				<MenuItem onClick={openSFovView}>
					<ListItemIcon>
						<ImageIcon />
					</ListItemIcon>
					<ListItemText>sFOV View</ListItemText>
				</MenuItem>
			</Menu>
		</Box>
	);
};
