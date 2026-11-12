import {
	Checkbox,
	FormControlLabel,
	Radio,
	RadioGroup,
	Slider,
	Stack,
	Typography,
} from "@mui/material";

import {
	useImageViewProp,
	useShowImage,
} from "~/features/misc/hooks/useImageViewProp";
import { useReTestRun } from "~/features/recipe/hooks";
import { useResultJobType } from "../../misc/hooks/useResultsJobType";
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

export const TestRunMenu = (): JSX.Element => {
	const { enableDefect, enableDesign, hasReferences, enableIntermediate } =
		useResultJobType();
	const {
		imageViewProp,
		setShowRoi,
		setShowDefect,
		setDefectAlpha,
		setSemAlpha,
		setShowDesignData,
		setShowBoxSegmentData,
	} = useImageViewProp();

	const { scale, updateScaleAndPosition } = useSFovView();

	const { showImageType, setShowImage, showSEMType, setShowSEM } =
		useShowImage();
	const { testRunProcessedCount } = useReTestRun();

	// CheckBoxイベントハンドラー 設定値を更新
	const handleChangeDefectBoxChecked = (
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
	const handleChangeDesignDataChecked = (
		_event: React.ChangeEvent<HTMLInputElement>,
		checked: boolean,
	): void => {
		setShowDesignData(checked);
	};

	// RadioButtonイベントハンドラー 設定値を更新
	const handleRadioButtonChange = (
		_event: React.ChangeEvent<HTMLInputElement>,
		value: string,
	): void => {
		setShowImage(value);
	};

	// Sliderイベントハンドラー 設定値を更新
	const handleChangeDefectSlider = (
		_event: Event,
		newValue: number | number[],
	): void => {
		setDefectAlpha(Array.isArray(newValue) ? newValue[0] : newValue);
	};
	const handleChangeImgSlider = (
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
						size="small"
						checked={imageViewProp.showRoi}
						disabled={!enableDefect}
						onChange={handleChangeDefectBoxChecked}
					/>
				}
				label="DefectBox"
			/>
			<FormControlLabel
				control={
					<Checkbox
						size="small"
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
			<RadioGroup value={showImageType} row onChange={handleRadioButtonChange}>
				<FormControlLabel
					control={<Radio size="small" />}
					value="sem"
					label="SEM"
				/>
				<FormControlLabel
					control={
						<Radio size="small" disabled={testRunProcessedCount === 0} />
					}
					value="preprocessed-sem"
					label="Preprocessed"
				/>
				<FormControlLabel
					control={
						<Radio size="small" disabled={testRunProcessedCount === 0} />
					}
					value="potential"
					label="Potential"
				/>
				{enableIntermediate ? (
					<FormControlLabel
						control={
							<Radio size="small" disabled={testRunProcessedCount === 0} />
						}
						value="intermediate"
						label="Intermediate"
					/>
				) : (
					<></>
				)}
				<FormControlLabel
					control={<Radio size="small" />}
					value="none"
					label="None"
				/>
			</RadioGroup>
			<Slider
				size="small"
				sx={{ padding: "0", margin: semAlpha.margin, width: semAlpha.width }}
				defaultValue={imageViewProp.semAlpha}
				value={imageViewProp.semAlpha}
				valueLabelDisplay="auto"
				min={semAlpha.minValue}
				max={semAlpha.maxValue}
				onChange={handleChangeImgSlider}
			/>
			<FormControlLabel
				control={
					<Checkbox
						size="small"
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
			<ImageTypeToggleButtonGroup
				hasReferences={hasReferences}
				showSEMType={showSEMType}
				setShowSEM={setShowSEM}
			/>
		</Stack>
	);
};
