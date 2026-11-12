import "allotment/dist/style.css";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import { Allotment } from "allotment";
import { useEffect, useRef, useState } from "react";

import { TEST_RUN_PATH } from "~/config";
import { TestRunInfoAndDefect } from "~/features/info-defectinfo-defects/layouts/TestRunInfoAndDefect";
import { useMfovnoForSEMImage } from "~/features/map/hooks/useMfovnoForSEMImage";
import { useSfovnoForSEMImage } from "~/features/map/hooks/useSfovnoForSEMImage";
import { hasDesign, isDefectInspection } from "~/features/recipe/api";
import {
	useDesignEnabledValue,
	useDesignType,
	useInitRecipeCommonParam,
	useJobType,
	useSetTestRunState,
} from "~/features/recipe/hooks";
import { TestRunSFovImage } from "~/features/s-fov-image/layouts/TestRunSFovImage";
import type { SFovInfoParam } from "~/features/s-fov-info/types";
import { isPositiveInteger } from "~/utils/numUtils";
import { getPathParams } from "~/utils/urlUtils";
import { UserMenuBar } from "../../users/layouts/UserMenuBar";
import { useSetImageViewDefectAndDesign } from "../hooks/useImageViewProp";
import { useResultName } from "../hooks/useResultName";
import { TestRunRecipe } from "./TestRunRecipe";

function getTestRunParam(): SFovInfoParam {
	// URLパス /test-run/{ResultName}/{mFovNo}-{sFovNo} から各種パラメータを取得
	const pathParams = getPathParams(`${TEST_RUN_PATH}/`);
	if (pathParams.length < 2) {
		return { resultName: "", mFovNo: -1, sFovNo: -1 };
	}
	const fovNos = pathParams[1].split("-");
	if (fovNos.length !== 2) {
		return { resultName: pathParams[0], mFovNo: -1, sFovNo: -1 };
	}
	const rawMFovNo = Number(fovNos[0]);
	const rawSFovNo = Number(fovNos[1]);
	return {
		resultName: pathParams[0],
		mFovNo: isPositiveInteger(rawMFovNo) ? rawMFovNo : -1,
		sFovNo: isPositiveInteger(rawSFovNo) ? rawSFovNo : -1,
	};
}

const useInitImageView = () => {
	const init = useRef(false);
	const designType = useDesignType();
	const jobType = useJobType();
	const enabled = useDesignEnabledValue();
	const setImageViewDefectAndDesign = useSetImageViewDefectAndDesign();

	// biome-ignore lint/correctness/useExhaustiveDependencies: レシピロード後に1回だけ実行する
	useEffect(() => {
		if (init.current) return;
		if (designType == null) return; // まだレシピをロードしていない

		setImageViewDefectAndDesign(
			isDefectInspection(jobType),
			hasDesign({ jobType, design: { enabled } }),
		);

		init.current = true;
	}, [designType]);
};

// React.lazy を利用するため default export を使用する
export const TestRun = (): JSX.Element => {
	const [visibleLeftArea, setVisibleLeftArea] = useState(true);
	const [visibleRightArea, setVisibleRightArea] = useState(true);
	const { setResultName } = useResultName();
	const setRecipeCommonParam = useInitRecipeCommonParam();
	const { setMfovnoForSEMImage } = useMfovnoForSEMImage();
	const { setSfovnoForSEMImage } = useSfovnoForSEMImage();
	document.title = "Test Run";

	const { initTestRunState } = useSetTestRunState();

	useEffect(() => {
		const param = getTestRunParam();
		setResultName(param.resultName);
		setRecipeCommonParam(param.resultName);
		setMfovnoForSEMImage(param.mFovNo);
		setSfovnoForSEMImage(param.sFovNo);

		initTestRunState(param.mFovNo, param.sFovNo);
	}, [
		setRecipeCommonParam,
		setResultName,
		setMfovnoForSEMImage,
		setSfovnoForSEMImage,
		initTestRunState,
	]);

	useInitImageView();

	return (
		<>
			<Box sx={{ height: "100vh", width: "100%" }}>
				<Allotment defaultSizes={[50, 624, 1161, 300, 50]}>
					<Allotment.Pane maxSize={50} minSize={50} visible={!visibleLeftArea}>
						{/* 左サイド非表示エリア */}
						<Box
							sx={{
								height: "100%",
								backgroundColor: "primary.main",
								textAlign: "center",
							}}
						>
							<IconButton
								aria-label="open"
								color="primary"
								style={{
									marginLeft: "auto",
									color: "white",
									transform: "rotate(270deg)",
								}}
								onClick={() => {
									setVisibleLeftArea(true);
								}}
							>
								<ExpandMoreIcon />
							</IconButton>
						</Box>
					</Allotment.Pane>
					<Allotment.Pane maxSize={624} minSize={393} visible={visibleLeftArea}>
						{/* Recipe表示エリア */}
						<Stack direction="column" sx={{ height: "100%", width: "100%" }}>
							<Box
								sx={{
									height: 24,
									color: "white",
									backgroundColor: "primary.main",
									borderTopStyle: "solid",
									borderTopColor: "primary.dark",
									display: "flex",
									flexDirection: "row",
								}}
							>
								{/* Recipeタイトル＋折り畳みボタン */}
								<Typography ml={2}>Recipe</Typography>
								<IconButton
									aria-label="close"
									color="primary"
									style={{
										marginLeft: "auto",
										color: "white",
										transform: "rotate(90deg)",
									}}
									onClick={() => {
										setVisibleLeftArea(false);
									}}
								>
									<ExpandMoreIcon />
								</IconButton>
							</Box>
							<TestRunRecipe />
						</Stack>
					</Allotment.Pane>
					<Allotment.Pane maxSize={Number.POSITIVE_INFINITY}>
						{/* SEM画像表示エリア */}
						<TestRunSFovImage />
					</Allotment.Pane>
					<Allotment.Pane
						maxSize={600}
						minSize={250}
						visible={visibleRightArea}
					>
						{/* ImageInfo,Defect表示エリア */}
						<Box sx={{ height: "100%", width: "100%" }}>
							<Box
								sx={{
									height: 24,
									color: "white",
									backgroundColor: "primary.main",
									borderTopStyle: "solid",
									borderTopColor: "primary.dark",
									display: "flex",
									flexDirection: "row",
								}}
							>
								{/* ImageInfoタイトル＋折り畳みボタン */}
								<Typography ml={2}>Image Info</Typography>
								<IconButton
									aria-label="close"
									color="primary"
									style={{
										marginLeft: "auto",
										color: "white",
										transform: "rotate(270deg)",
									}}
									onClick={() => {
										setVisibleRightArea(false);
									}}
								>
									<ExpandMoreIcon />
								</IconButton>
							</Box>
							<Allotment.Pane maxSize={900}>
								{/* 付帯情報Defect表示エリア */}
								<TestRunInfoAndDefect />
							</Allotment.Pane>
						</Box>
					</Allotment.Pane>
					<Allotment.Pane maxSize={50} minSize={50} visible={!visibleRightArea}>
						{/* 左サイド非表示エリア */}
						<Box
							sx={{
								height: "100%",
								backgroundColor: "primary.main",
								textAlign: "center",
							}}
						>
							<IconButton
								aria-label="open"
								color="primary"
								style={{
									marginLeft: "auto",
									color: "white",
									transform: "rotate(90deg)",
								}}
								onClick={() => {
									setVisibleRightArea(true);
								}}
							>
								<ExpandMoreIcon />
							</IconButton>
						</Box>
					</Allotment.Pane>
				</Allotment>
			</Box>
			<UserMenuBar top={-6} right={30} />
		</>
	);
};
export default TestRun;
