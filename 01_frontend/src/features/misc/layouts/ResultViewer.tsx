import "allotment/dist/style.css";

import { Box } from "@mui/system";
import { Allotment } from "allotment";
import { useEffect, useRef } from "react";

import { RESULT_VIEWER_PATH } from "~/config";
import { InfoAndDefect } from "~/features/info-and-defect/layouts/InfoAndDefect";
import { useMapAreaSize } from "~/features/map/hooks/useMapAreaSize";
import { MapArea } from "~/features/map/layouts/MapArea";
import { hasDesign, isDefectInspection } from "~/features/recipe/api";
import {
	useInitResultViewerCommonParam,
	useResultViewerCommonParam,
} from "~/features/s-fov-image/hooks/useResultViewerCommonParam";
import { SFovImage } from "~/features/s-fov-image/layouts/SFovImage";
import { useSetSFovList } from "~/features/s-fov-list/hooks/useFovList";
import { SFovList } from "~/features/s-fov-list/layouts/SFovList";
import { getPathParams } from "~/utils/urlUtils";
import { UserMenuBar } from "../../users/layouts/UserMenuBar";
import { useSetImageViewDefectAndDesign } from "../hooks/useImageViewProp";
import { useResultName } from "../hooks/useResultName";

function getResultName(): string {
	// URLパス /results/{ResultName} から Resultname を取得
	const pathParams = getPathParams(`${RESULT_VIEWER_PATH}/`);
	return pathParams.length > 0 ? pathParams[0] : "";
}

const useInitImageView = () => {
	const init = useRef(false);
	const { commonParam } = useResultViewerCommonParam();
	const setImageViewDefectAndDesign = useSetImageViewDefectAndDesign();

	// biome-ignore lint/correctness/useExhaustiveDependencies: レシピロード後に1回だけ実行する
	useEffect(() => {
		if (init.current) return;
		if (commonParam == null) return;

		setImageViewDefectAndDesign(
			isDefectInspection(commonParam.jobType),
			hasDesign(commonParam),
		);

		init.current = true;
	}, [commonParam]);
};

// React.lazy を利用するため default export を使用する
const ResultViewer = (): JSX.Element => {
	const { resultName, setResultName } = useResultName();
	const { setMapAreaWidth } = useMapAreaSize();
	const { setFetchedFovList } = useSetSFovList();
	const setCommonParam = useInitResultViewerCommonParam();
	document.title = "Result Viewer";
	setResultName(getResultName());

	useEffect(() => {
		if (resultName.length === 0) return;
		setFetchedFovList();
	}, [resultName, setFetchedFovList]);

	const handleMapAreaWidthChange = (sizes: number[]): void => {
		if (sizes.length > 0) setMapAreaWidth(sizes[0]);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: 初回のみ設定
	useEffect(() => {
		const resultName = getResultName();
		setResultName(resultName);
		setCommonParam(resultName);
	}, []);

	useInitImageView();

	return (
		<>
			<Box sx={{ height: "100vh", width: "100%" }}>
				<Allotment
					maxSize={300}
					minSize={100}
					defaultSizes={[310, 300, 965, 400]}
				>
					<Allotment.Pane maxSize={310}>
						{/* sFOVリスト表示エリア */}
						<SFovList />
					</Allotment.Pane>
					<Allotment onChange={handleMapAreaWidthChange}>
						{/* Map表示エリア */}
						<MapArea />
					</Allotment>
					<Allotment.Pane maxSize={Number.POSITIVE_INFINITY}>
						{/* SEM画像表示エリア */}
						<SFovImage />
					</Allotment.Pane>
					<Allotment.Pane maxSize={900}>
						{/* 付帯情報Defect表示エリア */}
						<InfoAndDefect />
					</Allotment.Pane>
				</Allotment>
			</Box>
			<UserMenuBar top={-6} />
		</>
	);
};
export default ResultViewer;
