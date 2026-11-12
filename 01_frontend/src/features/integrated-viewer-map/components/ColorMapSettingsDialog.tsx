import {
	Box,
	Button,
	Dialog,
	FormControl,
	FormControlLabel,
	Radio,
	RadioGroup,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { TitleBarWithCloseButton } from "~/features/integrated-viewer-sfov-view/components/TitleBarWithCloseButton";
import {
	COLOR_MAP_PRESETS,
	getColorMapGradient,
	type ColorMapPresetId,
	type ColorMapSettings,
} from "../utils/colorMap";

interface ColorMapSettingsDialogProps {
	open: boolean;
	settings: ColorMapSettings;
	onClose: () => void;
	onApply: (settings: ColorMapSettings) => void;
}

export const ColorMapSettingsDialog = ({
	open,
	settings,
	onClose,
	onApply,
}: ColorMapSettingsDialogProps): JSX.Element => {
	const [draftMaxCount, setDraftMaxCount] = useState(String(settings.maxCount));
	const [draftPresetId, setDraftPresetId] = useState(settings.presetId);
	const [validationError, setValidationError] = useState("");

	useEffect(() => {
		if (!open) return;
		setDraftMaxCount(String(settings.maxCount));
		setDraftPresetId(settings.presetId);
		setValidationError("");
	}, [open, settings.maxCount, settings.presetId]);

	const parsedMaxCount = Number(draftMaxCount);
	const isValidMaxCount =
		Number.isSafeInteger(parsedMaxCount) && parsedMaxCount > 0;
	const handleApply = (): void => {
		if (!isValidMaxCount) {
			setValidationError("最大値は1以上の整数を入力してください。");
			return;
		}
		onApply({ maxCount: parsedMaxCount, presetId: draftPresetId });
		onClose();
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="sm"
			fullWidth
			aria-label="Color Map Settings"
		>
			<Box>
				<TitleBarWithCloseButton
					title="Color Map Settings"
					onClickEvent={onClose}
					sx={{ textAlign: "center" }}
				/>
				<Stack spacing={2} sx={{ p: 2 }}>
					<TextField
						label="最大欠陥数"
						value={draftMaxCount}
						onChange={(event) => {
							setDraftMaxCount(event.target.value);
							setValidationError("");
						}}
						inputProps={{ inputMode: "numeric" }}
						error={validationError.length > 0}
						helperText={validationError || " "}
					/>
					<FormControl>
						<Typography component="legend" variant="subtitle2">
							カラープリセット
						</Typography>
						<RadioGroup
							aria-label="カラープリセット"
							value={draftPresetId}
							onChange={(event) =>
								setDraftPresetId(event.target.value as ColorMapPresetId)
							}
						>
							{COLOR_MAP_PRESETS.map((preset) => (
								<FormControlLabel
									key={preset.id}
									value={preset.id}
									control={
										<Radio inputProps={{ "aria-label": preset.label }} />
									}
									label={
										<Box
											aria-hidden="true"
											sx={{
												width: 180,
												height: 12,
												border: "1px solid",
												borderColor: "divider",
												background: getColorMapGradient(preset.id),
											}}
										/>
									}
								/>
							))}
						</RadioGroup>
					</FormControl>
					<Box sx={{ display: "flex", justifyContent: "flex-end" }}>
						<Button variant="contained" onClick={handleApply}>
							Apply
						</Button>
					</Box>
				</Stack>
			</Box>
		</Dialog>
	);
};