import {
	Checkbox,
	FormControlLabel,
	Slider,
	Stack,
	Typography,
} from "@mui/material";

import {
	useImageViewProp,
	useShowImage,
} from "~/features/misc/hooks/useImageViewProp";
import { useResultJobType } from "~/features/misc/hooks/useResultsJobType";
import { MAX_SCALE, MIN_SCALE, useSFovView } from "../hooks/useSFovView";
import { ImageTypeToggleButtonGroup } from "./ImageTypeToggleButtonGroup";

const defectAlphaProps = {
	width: 120,
	maxValue: 100,
	minValue: 0,
	margin: "20px",
};
const semAlpha = defectAlphaProps;

const magnificationProps = {
	width: 200,
	labelWidth: 80,
	maxValue: MAX_SCALE * 100,
	minValue: MIN_SCALE * 100,
	increment: 10,
	margin: "20px",
};

export const Menu = (): JSX.Element => {
	const { enableDefect, enableDesign, hasReferences } = useResultJobType();
	const {
		imageViewProp,
		setShowRoi,
		setShowDefect,
		setDefectAlpha,
		setSemAlpha,
		setShowDesignData,
		setShowScale,
		setShowBoxSegmentData,
	} = useImageViewProp();
	const { isHiddenSem, setShowImage, showSEMType, setShowSEM } = useShowImage();

	const { scale, updateScaleAndPosition } = useSFovView();

	// CheckBoxイベントハンドラー 設定値を更新
	const handleChangeRoiChecked = (
		_event: React.ChangeEvent<HTMLInputElement>,
		checked: boolean,
	): void => {
		setShowRoi(checked);
		setShowBoxSegmentData(checked);
	};
	const handleChangeDefectChecked = (
		_event: React.ChangeEvent<HTMLInputElement>,
		checked: boolean,
	): void => {
		setShowDefect(checked);
	};
	const handleChangeSemChecked = (
		_event: React.ChangeEvent<HTMLInputElement>,
		checked: boolean,
	): void => {
		setShowImage(checked ? "sem" : "none");
	};
	const handleChangeDesignDataChecked = (
		_event: React.ChangeEvent<HTMLInputElement>,
		checked: boolean,
	): void => {
		setShowDesignData(checked);
	};
	const handleChangeScaleChecked = (
		_event: React.ChangeEvent<HTMLInputElement>,
		checked: boolean,
	): void => {
		setShowScale(checked);
	};

	// Sliderイベントハンドラー 設定値を更新
	const handleChangeDefectSlider = (
		_event: Event,
		newValue: number | number[],
	): void => {
		setDefectAlpha(Array.isArray(newValue) ? newValue[0] : newValue);
	};
	const handleChangeSemSlider = (
		_event: Event,
		newValue: number | number[],
	): void => {
		setSemAlpha(Array.isArray(newValue) ? newValue[0] : newValue);
	};
	const handleChangemagnificatonSlider = (
		_event: Event,
		newValue: number | number[],
	): void => {
		updateScaleAndPosition(
			(Array.isArray(newValue) ? newValue[0] : newValue) / 100,
		);
	};

	return (
		<Stack
			direction="row"
			sx={{ marginLeft: "1em", display: "flex", flexWrap: "wrap" }}
		>
			<FormControlLabel
				control={
					<Checkbox
						checked={imageViewProp.showRoi}
						disabled={!enableDefect}
						onChange={handleChangeRoiChecked}
					/>
				}
				label="ROI"
			/>
			<FormControlLabel
				control={
					<Checkbox
						checked={imageViewProp.showDefect}
						disabled={!enableDefect}
						onChange={handleChangeDefectChecked}
					/>
				}
				label="Defect"
			/>
			<Slider
				size="small"
				sx={{
					padding: "0",
					margin: defectAlphaProps.margin,
					width: defectAlphaProps.width,
				}}
				disabled={!enableDefect || !imageViewProp.showDefect}
				defaultValue={imageViewProp.defectAlpha}
				value={imageViewProp.defectAlpha}
				valueLabelDisplay="auto"
				min={defectAlphaProps.minValue}
				max={defectAlphaProps.maxValue}
				onChange={handleChangeDefectSlider}
			/>
			<FormControlLabel
				control={
					<Checkbox checked={!isHiddenSem} onChange={handleChangeSemChecked} />
				}
				label="SEM"
			/>
			<Slider
				size="small"
				sx={{ padding: "0", margin: semAlpha.margin, width: semAlpha.width }}
				disabled={isHiddenSem}
				defaultValue={imageViewProp.semAlpha}
				value={imageViewProp.semAlpha}
				valueLabelDisplay="auto"
				min={semAlpha.minValue}
				max={semAlpha.maxValue}
				onChange={handleChangeSemSlider}
			/>
			<FormControlLabel
				control={
					<Checkbox
						checked={imageViewProp.showDesignData}
						disabled={!enableDesign}
						onChange={handleChangeDesignDataChecked}
					/>
				}
				label="DesignData"
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
				defaultValue={scale * 100}
				value={scale * 100}
				valueLabelDisplay="auto"
				min={magnificationProps.minValue}
				max={magnificationProps.maxValue}
				step={magnificationProps.increment}
				valueLabelFormat={`${Math.floor(scale * 100)}%`}
				onChange={handleChangemagnificatonSlider}
			/>
			<FormControlLabel
				control={
					<Checkbox
						checked={imageViewProp.showScale}
						onChange={handleChangeScaleChecked}
					/>
				}
				label="Scale"
			/>
			<ImageTypeToggleButtonGroup
				hasReferences={hasReferences}
				showSEMType={showSEMType}
				setShowSEM={setShowSEM}
			/>
		</Stack>
	);
};
