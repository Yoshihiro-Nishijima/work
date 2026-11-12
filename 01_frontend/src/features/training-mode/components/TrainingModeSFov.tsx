import { Container } from "@pixi/react";

import { SFovBorder } from "~/features/integrated-viewer-map/components/SFovBorder";
import { isSFovThumbnailDisplayLevel } from "~/features/integrated-viewer-map/hooks/useMapInfo";

import { TrainingModeSFovThumbnail } from "./TrainingModeSFovThumbnail";
import { TrainingModeSelectedSFov } from "./TrainingModeSelectedSFov";

export const TrainingModeSFov = (): JSX.Element => {
	if (!isSFovThumbnailDisplayLevel()) return <></>;
	return (
		<Container>
			<TrainingModeSFovThumbnail />
			<SFovBorder />
			<TrainingModeSelectedSFov />
		</Container>
	);
};
