import "allotment/dist/style.css";

import { Box } from "@mui/system";
import { Allotment } from "allotment";

import { PROGRESS_MONITOR_PATH } from "~/config";
import { InfoAndDefect } from "~/features/info-and-defect/layouts/InfoAndDefect";
import { SFovImage } from "~/features/s-fov-image/layouts/SFovImage";
import { SFovList } from "~/features/s-fov-list/layouts/SFovList";
import { getPathParams } from "~/utils/urlUtils";
import { UserMenuBar } from "../../users/layouts/UserMenuBar";
import { useResultName } from "../hooks/useResultName";

const getResultName = (): string => {
	// URLパス /progress-monitor/{JobName} から Resultname を取得
	const pathParams = getPathParams(`${PROGRESS_MONITOR_PATH}/`);
	return pathParams.length > 0 ? pathParams[0] : "";
};

// React.lazy を利用するため default export を使用する
const ProgressMonitor = (): JSX.Element => {
	const { setResultName } = useResultName();

	document.title = "Progress Monitor";

	setResultName(getResultName());

	return (
		<>
			<Box sx={{ height: "100vh", width: "100%" }}>
				<Allotment maxSize={300} minSize={100} defaultSizes={[310, 1265, 300]}>
					<Allotment.Pane maxSize={310}>
						{/* sFOVリスト表示エリア */}
						<SFovList />
					</Allotment.Pane>
					<Allotment.Pane maxSize={Number.POSITIVE_INFINITY}>
						{/* SEM画像表示エリア */}
						<SFovImage />
					</Allotment.Pane>
					<Allotment>
						{/* 付帯情報Defect表示エリア */}
						<InfoAndDefect />
					</Allotment>
				</Allotment>
			</Box>
			<UserMenuBar top={-6} />
		</>
	);
};
export default ProgressMonitor;
