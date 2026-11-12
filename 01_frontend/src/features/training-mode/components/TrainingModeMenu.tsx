import "allotment/dist/style.css";

import { Box } from "@mui/system";
import { Allotment } from "allotment";

import { TitleBar } from "~/components/elements";
import { INTEGRATED_VIEWER_MAP_TITLEBAR_HEIGHT } from "~/features/integrated-viewer-map/hooks/useMapAreaInfo";
import { SFovDataGridForTraining } from "~/features/s-fov-list/components/SFovDataGridForTraining";

import { SFovDataGridForTrainingReview } from "~/features/s-fov-list/components/SFovDataGridForTrainingReview";
import { useReviewModal } from "~/features/training-mode-sfov-view/hooks/useReviewModal";
import { BulkImport } from "./BulkImport";

export const TrainingModeMenu = (): JSX.Element => {
	const SFOV_LIST_HEADER_HEIGHT = 24; // sFOV Listタイトルバーの高さ(24px)
	const BULK_IMPORT_HEADER_HEIGHT = 70; // BulkImportエリアの高さ(70px)

	const { isReviewModalOpen } = useReviewModal();

	return (
		<Box sx={{ height: "100%" }}>
			<Allotment vertical>
				<Allotment.Pane
					minSize={BULK_IMPORT_HEADER_HEIGHT}
					maxSize={BULK_IMPORT_HEADER_HEIGHT}
				>
					<Box sx={{ height: "100vh", bgcolor: "white" }}>
						<BulkImport />
					</Box>
				</Allotment.Pane>
				<Allotment.Pane>
					<Box sx={{ height: "100vh", bgcolor: "white" }}>
						<TitleBar
							title={isReviewModalOpen ? "Training List" : "sFOV List"}
							sx={{ height: 24 }}
						/>
						{isReviewModalOpen ? (
							<SFovDataGridForTrainingReview
								height={`calc(100% - ${INTEGRATED_VIEWER_MAP_TITLEBAR_HEIGHT}px - ${INTEGRATED_VIEWER_MAP_TITLEBAR_HEIGHT}px - ${BULK_IMPORT_HEADER_HEIGHT}px - ${SFOV_LIST_HEADER_HEIGHT}px)`}
								isGetResultsRecord
							/>
						) : (
							<SFovDataGridForTraining
								height={`calc(100% - ${INTEGRATED_VIEWER_MAP_TITLEBAR_HEIGHT}px - ${BULK_IMPORT_HEADER_HEIGHT}px - ${SFOV_LIST_HEADER_HEIGHT}px)`}
								isGetResultsRecord
							/>
						)}
					</Box>
				</Allotment.Pane>
			</Allotment>
		</Box>
	);
};
