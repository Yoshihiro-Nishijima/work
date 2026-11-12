import {
	Checkbox,
	FormControlLabel,
	Slider,
	Stack,
	Typography,
} from "@mui/material";

import { useSegmentationImageViewProp } from "../hooks/useSegmentationImageViewProp";

export const maxMagnification = 30;
export const minMagnification = 0.1;

const alphaProps = {
	width: 120,
	maxValue: 100,
	minValue: 0,
	margin: "20px",
};

const magnificationProps = {
	width: 200,
	labelWidth: 80,
	maxValue: maxMagnification * 100,
	minValue: minMagnification * 100,
	increment: 10,
	margin: "20px",
};

export const SegmentationMenu = (): JSX.Element => {
	const {
		imageViewProp,
		setShowSegmentation,
		setSegmentationAlpha,
		setMagnification,
	} = useSegmentationImageViewProp();

	// CheckBoxイベントハンドラー 設定値を更新
	const handleChangeSegmentationChecked = (
		e: React.ChangeEvent<HTMLInputElement>,
		checked: boolean,
	): void => {
		setShowSegmentation(checked);
	};

	// Sliderイベントハンドラー 設定値を更新
	const handleChangeSegmentationSlider = (
		event: Event,
		newValue: number | number[],
	): void => {
		setSegmentationAlpha(Array.isArray(newValue) ? newValue[0] : newValue);
	};

	const handleChangemagnificatonSlider = (
		event: Event,
		newValue: number | number[],
	): void => {
		setMagnification((Array.isArray(newValue) ? newValue[0] : newValue) / 100);
	};

	return (
		<Stack
			direction="row"
			sx={{ marginLeft: "1em", display: "flex", flexWrap: "wrap" }}
		>
			<FormControlLabel
				control={
					<Checkbox
						checked={imageViewProp.showSegmentation}
						onChange={handleChangeSegmentationChecked}
					/>
				}
				label="Segmentation"
			/>
			<Slider
				size="small"
				sx={{
					padding: "0",
					margin: alphaProps.margin,
					width: alphaProps.width,
				}}
				defaultValue={imageViewProp.segmentationAlpha}
				value={imageViewProp.segmentationAlpha}
				valueLabelDisplay="auto"
				min={alphaProps.minValue}
				max={alphaProps.maxValue}
				onChange={handleChangeSegmentationSlider}
			/>
			<FormControlLabel
				control={<Typography />}
				sx={{ width: magnificationProps.labelWidth }}
				label="Magnification:"
			/>
			<Slider
				size="small"
				sx={{
					padding: "0",
					margin: magnificationProps.margin,
					width: magnificationProps.width,
				}}
				defaultValue={imageViewProp.magnification * 100}
				value={imageViewProp.magnification * 100}
				valueLabelDisplay="auto"
				min={magnificationProps.minValue}
				max={magnificationProps.maxValue}
				step={magnificationProps.increment}
				valueLabelFormat={`${Math.floor(imageViewProp.magnification * 100)}%`}
				onChange={handleChangemagnificatonSlider}
			/>
		</Stack>
	);
};
