// SFOV View SFOV表示エリア用ツールバー
import CrisisAlertIcon from "@mui/icons-material/CrisisAlert";
import Crop75Icon from "@mui/icons-material/Crop75";
import FluorescentIcon from "@mui/icons-material/Fluorescent";
import Grid4x4Icon from "@mui/icons-material/Grid4x4";
import ImageIcon from "@mui/icons-material/Image";
import { Box, Stack } from "@mui/material";
import { ToggleSlider } from "~/components/elements";

import {
	useImageViewProp,
	useShowImage,
} from "~/features/misc/hooks/useImageViewProp";

import CrossIcon from "@mui/icons-material/Add";
import { useSFov } from "~/features/integrated-viewer-map/hooks/useSFov";
import { useReviewModal } from "~/features/training-mode-sfov-view/hooks/useReviewModal";
import { useResultJobType } from "../../misc/hooks/useResultsJobType";
import { SFovViewToggle } from "./SFovViewToggle";

export const SFovViewToolBar = (): JSX.Element => {
	const { enableDefect, enableDesign, enableBoxSegment } = useResultJobType();
	const {
		imageViewProp,
		setShowDefect,
		setDefectAlpha,
		setSemAlpha,
		setShowRoi,
		setShowBoxSegmentData,
		setShowDesignData,
		setShowCrossData,
	} = useImageViewProp();
	const { isHiddenSem, setShowImage } = useShowImage();
	const { isSpecifiedCoordInSFov } = useSFov();
	const { isReviewModalOpen } = useReviewModal();

	if (isReviewModalOpen && imageViewProp.showCrossData) {
		setShowCrossData(false);
	}

	// ToggleButtonイベントハンドラー 設定値を更新
	const handleChangeDefectSelected = (): void => {
		setShowDefect(!imageViewProp.showDefect);
	};
	const handleChangeSemSelected = (): void => {
		setShowImage(isHiddenSem ? "sem" : "none");
	};
	const handleChangeDefectBoxSelected = (): void => {
		setShowRoi(!imageViewProp.showRoi);
	};
	const handleChangeCareAreaSelected = (): void => {
		setShowBoxSegmentData(!imageViewProp.showBoxSegmentData);
	};
	const handleChangeDesignDataSelected = (): void => {
		setShowDesignData(!imageViewProp.showDesignData);
	};
	const handleChangeCrossDataSelected = (): void => {
		setShowCrossData(!imageViewProp.showCrossData);
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

	// ToolBar表示
	return (
		<Box
			sx={{
				borderBottom: 1,
				height: 70,
			}}
		>
			<Stack sx={{ height: 15 }} />{" "}
			{/* Sliderの吹き出し数値(valueLabelDisplay)表示用余白 */}
			<Stack direction="row" sx={{ height: 40 }}>
				<ToggleSlider
					title="Defect"
					toggleIcon={<CrisisAlertIcon sx={{ mx: 0, p: 0 }} />}
					isSelected={imageViewProp.showDefect}
					isDisabled={!enableDefect}
					toggleValue="Defect"
					handleChangeToggleEvent={handleChangeDefectSelected}
					defaultValue={imageViewProp.defectAlpha}
					sliderValue={imageViewProp.defectAlpha}
					handleChangeSliderEvent={handleChangeDefectSlider}
				/>
				<ToggleSlider
					title="SEM"
					toggleIcon={<ImageIcon sx={{ mx: 0, p: 0 }} />}
					isSelected={!isHiddenSem}
					isDisabled={false}
					toggleValue="SEM"
					handleChangeToggleEvent={handleChangeSemSelected}
					defaultValue={imageViewProp.semAlpha}
					sliderValue={imageViewProp.semAlpha}
					handleChangeSliderEvent={handleChangeSemSlider}
				/>
				<SFovViewToggle
					title="DefectBox"
					toggleIcon={<Crop75Icon sx={{ mx: 0, p: 0 }} />}
					isSelected={imageViewProp.showRoi}
					isDisabled={!enableDefect}
					value="DefectBox"
					handleChangeToggleEvent={handleChangeDefectBoxSelected}
				/>
				<SFovViewToggle
					title="CareArea"
					toggleIcon={<FluorescentIcon sx={{ mx: 0, p: 0 }} />}
					isSelected={imageViewProp.showBoxSegmentData}
					isDisabled={!enableBoxSegment}
					value="CareArea"
					handleChangeToggleEvent={handleChangeCareAreaSelected}
				/>
				<SFovViewToggle
					title="Design"
					toggleIcon={<Grid4x4Icon sx={{ mx: 0, p: 0 }} />}
					isSelected={imageViewProp.showDesignData}
					isDisabled={!enableDesign}
					value="Design"
					handleChangeToggleEvent={handleChangeDesignDataSelected}
				/>
				{!isReviewModalOpen && (
					<SFovViewToggle
						title="Cross"
						toggleIcon={<CrossIcon sx={{ mx: 0, p: 0 }} />}
						isSelected={imageViewProp.showCrossData}
						isDisabled={!isSpecifiedCoordInSFov}
						value="Cross"
						handleChangeToggleEvent={handleChangeCrossDataSelected}
					/>
				)}
			</Stack>
		</Box>
	);
};
