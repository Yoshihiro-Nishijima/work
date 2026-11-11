import { Alert, Box, Button, Slider, Typography } from "@mui/material";
import {
	BarChart,
	type BarElementOwnerState,
	BarElementPath,
	type BarElementProps,
} from "@mui/x-charts/BarChart";
import type { ChartsItemContentProps } from "@mui/x-charts/ChartsTooltip";
import { useState } from "react";
import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

import { useDefectHistogramCategories } from "../hooks/useDefectHistogramCategories";
import type { DefectHistogramItemState } from "../types";
import { mapDefectHistogramChartData } from "../utils/mapDefectHistogram";
import {
	formatHistogramValue,
	getHistogramBinRange,
	getHistogramStep,
	histogramCountFromLog,
	moveHistogramRange,
} from "../utils/rangeValues";
import { DefectHistogramDetailsDialog } from "./DefectHistogramDetailsDialog";

type Props = {
	item: DefectHistogramItemState;
	onRemove: (id: string) => void;
	onRangeChange: (
		item: DefectHistogramItemState,
		range: [number, number],
	) => void;
	onRangeCommit: (
		item: DefectHistogramItemState,
		range: [number, number],
	) => void;
	onDetailsOpen: (
		item: DefectHistogramItemState,
		range: [number, number],
	) => void;
	onReset: (item: DefectHistogramItemState) => void;
	onLogYAxisChange: (id: string, value: boolean) => void;
};

type RangeDragState = {
	pointerId: number;
	startX: number;
	trackWidth: number;
	startRange: [number, number];
	latestRange: [number, number];
};

export const DefectHistogramItem = ({
	item,
	onRemove,
	onRangeChange,
	onRangeCommit,
	onDetailsOpen,
	onReset,
	onLogYAxisChange,
}: Props): JSX.Element => {
	const { getCategory } = useDefectHistogramCategories();
	const [detailsOpen, setDetailsOpen] = useState(false);
	const sliderWrapperRef = useRef<HTMLDivElement>(null);
	const rangeDragRef = useRef<RangeDragState | null>(null);
	const result = item.result;
	const sliderMin = result?.dataMin ?? 0;
	const sliderMax =
		result?.dataMin === result?.dataMax
			? sliderMin + 1
			: (result?.dataMax ?? 1);
	const step = getHistogramStep(sliderMin, sliderMax);
	const range = item.range ?? [sliderMin, sliderMax];
	const categories = result
		? [...result.categories].sort(
				(left, right) =>
					getCategory(left.categoryNo).order -
					getCategory(right.categoryNo).order,
			)
		: [];
	const logCategoryCounts =
		item.logYAxis && (result?.categories.length ?? 0) > 0;
	const chartData = result
		? mapDefectHistogramChartData(result, logCategoryCounts)
		: [];
	const formatChartCount = (value: number | null): string =>
		Math.round(
			logCategoryCounts ? histogramCountFromLog(value ?? 0) : (value ?? 0),
		).toLocaleString();

	const HistogramTooltip = ({
		itemData,
	}: ChartsItemContentProps): JSX.Element | null => {
		if (result == null) return null;
		const index = itemData.dataIndex;
		if (index == null || index < 0) return null;
		const lower = result.edges[index];
		const upper = result.edges[index + 1];
		const total = result.counts[index];
		if (lower == null || upper == null || total == null) return null;
		return (
			<Box sx={{ p: 1 }}>
				<Typography variant="caption" display="block">
					{formatHistogramValue(lower, step)} ～{" "}
					{formatHistogramValue(upper, step)}
				</Typography>
				{categories.map((category) => (
					<Typography
						key={category.categoryNo}
						variant="caption"
						display="block"
					>
						{getCategory(category.categoryNo).label}:{" "}
						{(category.counts[index] ?? 0).toLocaleString()}
					</Typography>
				))}
				<Typography variant="caption" display="block" fontWeight="bold">
					合計: {total.toLocaleString()}
				</Typography>
			</Box>
		);
	};

	const selectBin = (index: number): void => {
		if (result == null || index >= result.counts.length) return;
		const binRange = getHistogramBinRange(result.edges, index);
		if (binRange != null) onRangeCommit(item, binRange);
	};

	type SelectableBarProps = BarElementProps & {
		ownerState?: BarElementOwnerState;
	};
	const SelectableBar = (props: SelectableBarProps): JSX.Element => {
		const {
			ownerState,
			id: _id,
			dataIndex: _dataIndex,
			color: _color,
			classes: _classes,
			highlightScope: _highlightScope,
			slots: _slots,
			slotProps: _slotProps,
			...pathProps
		} = props;
		if (ownerState == null) {
			throw new Error("MUI X Charts did not provide bar owner state.");
		}
		const dataIndex = ownerState.dataIndex;
		return (
			<BarElementPath
				{...pathProps}
				ownerState={ownerState}
				role="button"
				tabIndex={0}
				aria-label={
					dataIndex == null ? undefined : `bin ${dataIndex + 1} を選択`
				}
				style={{ ...pathProps.style, cursor: "pointer" }}
				onClick={(event) => {
					pathProps.onClick?.(event);
					if (dataIndex != null) selectBin(dataIndex);
				}}
				onKeyDown={(event) => {
					pathProps.onKeyDown?.(event);
					if (
						dataIndex != null &&
						(event.key === "Enter" || event.key === " ")
					) {
						event.preventDefault();
						selectBin(dataIndex);
					}
				}}
			/>
		);
	};

	const openDetails = (): void => {
		setDetailsOpen(true);
		if (range != null) onDetailsOpen(item, range);
	};

	const handlePointerDownCapture = (
		event: ReactPointerEvent<HTMLDivElement>,
	): void => {
		if (
			!(event.target instanceof Element) ||
			event.target.closest(".MuiSlider-track") == null
		) {
			return;
		}
		const sliderRoot =
			sliderWrapperRef.current?.querySelector(".MuiSlider-root");
		const trackWidth = sliderRoot?.getBoundingClientRect().width ?? 0;
		if (trackWidth <= 0) return;

		event.preventDefault();
		event.stopPropagation();
		rangeDragRef.current = {
			pointerId: event.pointerId,
			startX: event.clientX,
			trackWidth,
			startRange: [range[0], range[1]],
			latestRange: [range[0], range[1]],
		};
		event.currentTarget.setPointerCapture(event.pointerId);
	};

	const handlePointerMoveCapture = (
		event: ReactPointerEvent<HTMLDivElement>,
	): void => {
		const drag = rangeDragRef.current;
		if (drag == null || drag.pointerId !== event.pointerId) return;
		event.preventDefault();
		const delta =
			((event.clientX - drag.startX) / drag.trackWidth) *
			(sliderMax - sliderMin);
		const nextRange = moveHistogramRange(
			drag.startRange,
			delta,
			sliderMin,
			sliderMax,
			step,
		);
		if (
			nextRange[0] !== drag.latestRange[0] ||
			nextRange[1] !== drag.latestRange[1]
		) {
			drag.latestRange = nextRange;
			onRangeChange(item, nextRange);
		}
	};

	const finishRangeDrag = (event: ReactPointerEvent<HTMLDivElement>): void => {
		const drag = rangeDragRef.current;
		if (drag == null || drag.pointerId !== event.pointerId) return;
		rangeDragRef.current = null;
		if (
			drag.latestRange[0] !== drag.startRange[0] ||
			drag.latestRange[1] !== drag.startRange[1]
		) {
			onRangeCommit(item, drag.latestRange);
		}
		if (event.currentTarget.hasPointerCapture(event.pointerId)) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}
	};

	return (
		<Box
			sx={{
				p: 1.5,
				borderBottom: "1px solid",
				borderColor: "divider",
				minWidth: 320,
			}}
		>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					gap: 1,
				}}
			>
				<Typography fontWeight="bold">{item.fieldLabel}</Typography>
				<Button
					size="small"
					color="error"
					onClick={() => onRemove(item.histogramId)}
				>
					削除
				</Button>
			</Box>
			{item.status === "loading" && <Typography>Loading...</Typography>}
			{item.status === "error" && <Alert severity="error">{item.error}</Alert>}
			{item.status === "success" && result && result.counts.length === 0 && (
				<Typography sx={{ py: 4 }}>数値データがありません</Typography>
			)}
			{item.status === "success" && result && result.counts.length > 0 && (
				<>
					<BarChart
						dataset={chartData}
						xAxis={[
							{
								dataKey: "bin",
								scaleType: "band",
								tickLabelInterval: () => false,
							},
						]}
						yAxis={[
							{
								valueFormatter: logCategoryCounts
									? (value) => formatChartCount(value)
									: (value) => formatHistogramValue(value, step),
							},
						]}
						series={
							result.categories.length === 0
								? [
										{
											dataKey: "total",
											label: "Defects",
											valueFormatter: (value) =>
												Math.round(value ?? 0).toLocaleString(),
										},
									]
								: categories.map((category) => ({
										dataKey: `category-${category.categoryNo}`,
										label: getCategory(category.categoryNo).label,
										stack: "categories",
										color: getCategory(category.categoryNo).color,
										valueFormatter: (value) => formatChartCount(value),
									}))
						}
						tooltip={{ trigger: "item" }}
						slots={{
							bar: SelectableBar,
							itemContent: HistogramTooltip,
						}}
						height={280}
						sx={{ minWidth: 320, width: "100%" }}
					/>
					<Typography variant="body2">
						Matched: {result.matchedCount.toLocaleString()} / Numeric:{" "}
						{result.numericValueCount.toLocaleString()}
					</Typography>
					<Box
						ref={sliderWrapperRef}
						onPointerDownCapture={handlePointerDownCapture}
						onPointerMoveCapture={handlePointerMoveCapture}
						onPointerUpCapture={finishRangeDrag}
						onPointerCancelCapture={finishRangeDrag}
					>
						<Slider
							value={range}
							min={sliderMin}
							max={sliderMax}
							step={step}
							valueLabelDisplay="auto"
							valueLabelFormat={(value) => formatHistogramValue(value, step)}
							onChange={(_, value) => {
								if (
									Array.isArray(value) &&
									value.length === 2 &&
									typeof value[0] === "number" &&
									typeof value[1] === "number"
								) {
									onRangeChange(item, [value[0], value[1]]);
								}
							}}
							onChangeCommitted={(_, value) => {
								if (
									Array.isArray(value) &&
									value.length === 2 &&
									typeof value[0] === "number" &&
									typeof value[1] === "number"
								) {
									onRangeCommit(item, [value[0], value[1]]);
								}
							}}
						/>
					</Box>
					<Box
						sx={{
							display: "flex",
							gap: 1,
							alignItems: "center",
							flexWrap: "wrap",
						}}
					>
						<Typography variant="body2">
							選択範囲: {formatHistogramValue(range[0], step)} ～{" "}
							{formatHistogramValue(range[1], step)}
						</Typography>
						<Button size="small" onClick={() => onReset(item)}>
							リセット
						</Button>
						<Button size="small" onClick={openDetails}>
							詳細
						</Button>
					</Box>
					<Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
						{categories.map((category) => (
							<Typography key={category.categoryNo} variant="caption">
								{getCategory(category.categoryNo).label}:{" "}
								{category.counts.reduce((sum, count) => sum + count, 0)}
							</Typography>
						))}
					</Box>
				</>
			)}
			<DefectHistogramDetailsDialog
				item={item}
				open={detailsOpen}
				onClose={() => setDetailsOpen(false)}
				onRangeCommit={onRangeCommit}
				onLogYAxisChange={onLogYAxisChange}
			/>
		</Box>
	);
};
