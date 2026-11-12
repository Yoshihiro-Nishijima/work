import {
	Box,
	Checkbox,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControlLabel,
	FormGroup,
	Stack,
} from "@mui/material";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Select } from "~/components/elements";
import PrimaryButton from "~/components/elements/PrimaryButton";
import SecondaryButton from "~/components/elements/SecondaryButton";
import { Toast } from "~/components/elements/Toast";
import { useRemapCategories } from "../hooks/useRemapCategories";
import {
	type CategoryType,
	CategoryTypeList,
	type PutCategoryMappingParam,
	UNSET_CATEGORY,
	getCategoryColor,
} from "../types";

type Props = {
	value: string;
};

const CategorySwatch = ({ value }: Props) => {
	const isUndefined = value === "undefined";
	const color = isUndefined
		? getCategoryColor(UNSET_CATEGORY)
		: getCategoryColor(Number(value) as CategoryType);
	return (
		<>
			<Box
				aria-hidden
				sx={{
					width: "15px",
					height: "15px",
					borderRadius: "2px",
					bgcolor: color,
					// transpearentのときだけ影をつける
					boxShadow: isUndefined ? "inset 0 0 0 1px #ccc" : "none",
					display: "inline-flex",
					verticalAlign: "center",
					mr: 1,
				}}
			/>
		</>
	);
};

export default memo(CategorySwatch);

type RemapCategoriesDialogProps = {
	open: boolean;
	onClose: () => void;
};

export const RemapCategoriesDialog = ({
	open,
	onClose,
}: RemapCategoriesDialogProps): JSX.Element => {
	const [understandWarning, setUnderstandWarning] = useState(false);
	const { isRunning, isRemapped, message, remap, reset } = useRemapCategories();
	const [toastOpen, setToastOpen] = useState(false);

	// トースト調整座標の計算用にボタン位置取得用ref
	const ref = useRef<HTMLButtonElement>(null);
	const refBound = ref.current?.getBoundingClientRect();
	const TOAST_TOP_MARGIN = 20;

	// ボタンの下あたりにトースト表示
	const displayPosition = {
		top: `${(refBound?.bottom ?? 0) + TOAST_TOP_MARGIN}px`,
		right: `${!refBound ? 0 : window.innerWidth - refBound?.right}px`,
	};

	const selectOptions = useMemo(
		() =>
			CategoryTypeList.map((c) =>
				c === UNSET_CATEGORY ? "undefined" : String(c),
			),
		[],
	);

	const initialMapping = useMemo(() => {
		const m: Record<string, string> = {};
		for (const c of selectOptions) {
			m[String(c)] = String(c);
		}
		return m;
	}, [selectOptions]);

	const [mapping, setMapping] = useState<Record<string, string>>({});

	const hasChanges = useMemo(() => Object.keys(mapping).length > 0, [mapping]);

	// APPLY REMAP結果検知
	useEffect(() => {
		if (isRemapped == null) return;
		// 成功時はDialogを初期化する
		if (isRemapped) {
			setUnderstandWarning(false);
			setMapping({});
		}
		setToastOpen(true);
	}, [isRemapped]);

	const handleSetMapping = (from: string, to: string) => {
		setMapping((prev) => {
			if (to === initialMapping[from]) {
				if (prev[from] == null) return prev;
				const { [from]: _, ...next } = prev;
				if (Object.keys(next).length === 0) {
					setUnderstandWarning(false);
				}
				return next;
			}
			return { ...prev, [from]: to };
		});
	};

	const handleApply = () => {
		const updates = Object.entries(mapping).map(([from, to]) => {
			return {
				fromCategory:
					from === "undefined"
						? UNSET_CATEGORY
						: (Number(from) as CategoryType),
				toCategory:
					to === "undefined" ? UNSET_CATEGORY : (Number(to) as CategoryType),
			} as PutCategoryMappingParam;
		});
		if (updates.length === 0) return;
		remap(updates);
	};

	const handleDialogClose = () => {
		if (isRunning) return;
		reset();
		onClose();
	};

	return (
		<Dialog open={open} onClose={handleDialogClose} fullWidth>
			<DialogTitle>Remap Categories</DialogTitle>
			<DialogContent>
				<Stack spacing={2} sx={{ p: 1 }}>
					<Stack spacing={1}>
						{selectOptions.map((from) => {
							const fromKey = String(from);
							const label = `From: ${fromKey}`;
							const item =
								mapping[fromKey] ?? initialMapping[fromKey] ?? "undefined";
							return (
								<Box key={fromKey}>
									<Select
										label={label}
										item={item}
										setItem={(v) => handleSetMapping(fromKey, v)}
										selectOptions={selectOptions}
										renderOption={(val: string) => (
											<CategorySwatch value={val} />
										)}
										fullWidth
									/>
								</Box>
							);
						})}
					</Stack>

					<FormGroup>
						<FormControlLabel
							control={
								<Checkbox
									checked={understandWarning}
									disabled={!hasChanges}
									onChange={(e) => setUnderstandWarning(e.target.checked)}
								/>
							}
							label="I understand this cannot be undone."
						/>
					</FormGroup>
				</Stack>
			</DialogContent>
			<DialogActions>
				<SecondaryButton onClick={handleDialogClose} disabled={isRunning}>
					CLOSE
				</SecondaryButton>
				<PrimaryButton
					loading={isRunning}
					disabled={!hasChanges || !understandWarning}
					onClick={handleApply}
					ref={ref}
				>
					APPLY REMAP
				</PrimaryButton>
				<Toast
					message={message || ""}
					severity={isRemapped ? "success" : "error"}
					trigger={{ isOpen: toastOpen, onClose: () => setToastOpen(false) }}
					anchorOrigin={{ vertical: "top", horizontal: "right" }}
					displayPosition={displayPosition}
				/>
			</DialogActions>
		</Dialog>
	);
};
