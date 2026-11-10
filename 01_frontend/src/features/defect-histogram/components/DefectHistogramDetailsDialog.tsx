import {
	Alert,
	Box,
	Button,
	Checkbox,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControlLabel,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import { useDefectHistogramCategories } from "../hooks/useDefectHistogramCategories";
import type { DefectHistogramItemState } from "../types";
import {
	formatHistogramValue,
	getHistogramStep,
	histogramPercent,
	snapHistogramInput,
} from "../utils/rangeValues";

type Props = {
	item: DefectHistogramItemState;
	open: boolean;
	onClose: () => void;
	onRangeCommit: (
		item: DefectHistogramItemState,
		range: [number, number],
	) => void;
	onLogYAxisChange: (id: string, value: boolean) => void;
};

const formatPercent = (count: number, total: number): string =>
	`${histogramPercent(count, total).toFixed(1)}%`;

export const DefectHistogramDetailsDialog = ({
	item,
	open,
	onClose,
	onRangeCommit,
	onLogYAxisChange,
}: Props): JSX.Element => {
	const { getCategory } = useDefectHistogramCategories();
	const result = item.result;
	const minimum = result?.dataMin ?? 0;
	const maximum = result?.dataMax ?? minimum + 1;
	const sliderMaximum = maximum === minimum ? minimum + 1 : maximum;
	const step = getHistogramStep(minimum, sliderMaximum);
	const range = item.range ?? [minimum, sliderMaximum];
	const [lowerInput, setLowerInput] = useState(
		formatHistogramValue(range[0], step),
	);
	const [upperInput, setUpperInput] = useState(
		formatHistogramValue(range[1], step),
	);

	useEffect(() => {
		setLowerInput(formatHistogramValue(range[0], step));
		setUpperInput(formatHistogramValue(range[1], step));
	}, [range, step]);

	const commitBound = (bound: "lower" | "upper"): void => {
		const input = bound === "lower" ? lowerInput : upperInput;
		const fallback = bound === "lower" ? range[0] : range[1];
		const parsed = snapHistogramInput(input, minimum, sliderMaximum, step);
		if (parsed == null) {
			if (bound === "lower") {
				setLowerInput(formatHistogramValue(fallback, step));
			} else {
				setUpperInput(formatHistogramValue(fallback, step));
			}
			return;
		}

		const nextRange: [number, number] =
			bound === "lower"
				? [Math.min(parsed, range[1]), range[1]]
				: [range[0], Math.max(parsed, range[0])];
		if (bound === "lower") {
			setLowerInput(formatHistogramValue(nextRange[0], step));
		} else {
			setUpperInput(formatHistogramValue(nextRange[1], step));
		}
		if (nextRange[0] !== range[0] || nextRange[1] !== range[1]) {
			onRangeCommit(item, nextRange);
		}
	};

	const rangeResult = item.rangeResult;
	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
			<DialogTitle>{item.field} - 詳細</DialogTitle>
			<DialogContent dividers>
				<Stack spacing={2}>
					<Box>
						<Typography variant="subtitle2">選択範囲</Typography>
						<Stack direction="row" spacing={2} sx={{ mt: 1 }}>
							<TextField
								label="下限"
								type="number"
								size="small"
								value={lowerInput}
								inputProps={{
									min: minimum,
									max: range[1],
									step,
									"aria-label": "選択範囲の下限",
								}}
								onChange={(event) => setLowerInput(event.target.value)}
								onBlur={() => commitBound("lower")}
								onKeyDown={(event) => {
									if (event.key === "Enter") {
										event.preventDefault();
										commitBound("lower");
										event.currentTarget.blur();
									}
								}}
							/>
							<TextField
								label="上限"
								type="number"
								size="small"
								value={upperInput}
								inputProps={{
									min: range[0],
									max: sliderMaximum,
									step,
									"aria-label": "選択範囲の上限",
								}}
								onChange={(event) => setUpperInput(event.target.value)}
								onBlur={() => commitBound("upper")}
								onKeyDown={(event) => {
									if (event.key === "Enter") {
										event.preventDefault();
										commitBound("upper");
										event.currentTarget.blur();
									}
								}}
							/>
						</Stack>
					</Box>
					{item.rangeStatus === "loading" && (
						<Typography component="output">範囲集計中...</Typography>
					)}
					{item.rangeStatus === "error" && (
						<Alert severity="error">{item.rangeError}</Alert>
					)}
					{item.rangeStatus === "success" && rangeResult && (
						<Box>
							<Typography variant="subtitle2">全体</Typography>
							<Typography>
								下限未満: {rangeResult.counts.left} (
								{formatPercent(
									rangeResult.counts.left,
									rangeResult.numericValueCount,
								)}
								) / 選択範囲: {rangeResult.counts.selected} (
								{formatPercent(
									rangeResult.counts.selected,
									rangeResult.numericValueCount,
								)}
								) / 上限超過: {rangeResult.counts.right} (
								{formatPercent(
									rangeResult.counts.right,
									rangeResult.numericValueCount,
								)}
								)
							</Typography>
							{rangeResult.categories.map((category) => {
								const total =
									category.counts.left +
									category.counts.selected +
									category.counts.right;
								return (
									<Box key={category.categoryNo} sx={{ mt: 1 }}>
										<Typography variant="subtitle2">
											{getCategory(category.categoryNo).label}
										</Typography>
										<Typography variant="body2">
											下限未満: {category.counts.left} (
											{formatPercent(category.counts.left, total)}) / 選択範囲:{" "}
											{category.counts.selected} (
											{formatPercent(category.counts.selected, total)}) /
											上限超過: {category.counts.right} (
											{formatPercent(category.counts.right, total)})
										</Typography>
									</Box>
								);
							})}
						</Box>
					)}
					{item.result && item.result.categories.length > 0 && (
						<FormControlLabel
							control={
								<Checkbox
									checked={item.logYAxis}
									onChange={(event) =>
										onLogYAxisChange(item.histogramId, event.target.checked)
									}
								/>
							}
							label="対数Y軸"
						/>
					)}
				</Stack>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>閉じる</Button>
			</DialogActions>
		</Dialog>
	);
};
