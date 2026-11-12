import { Container } from "@pixi/react";
import type { MapChipFilter } from "~/features/defect-list/hooks/useDefect";

import { isSFovThumbnailDisplayLevel } from "../hooks/useMapInfo";
import { SFovBorder } from "./SFovBorder";
import { SFovThumbnail } from "./SFovThumbnail";
import { SelectedSFov } from "./SelectedSFov";
import type {
	HoverPointerPosition,
	HoverRegionChange,
	MapRegionKind,
} from "../types";

interface SFovProps {
	onAutoSelectDefect?: (region: MapChipFilter) => void;
	onHoverRegionChange?: HoverRegionChange;
	onMapRegionClickStart?: (
		regionKind: MapRegionKind,
		region: MapChipFilter,
		pointerPosition?: HoverPointerPosition,
	) => boolean;
	onMapRegionSelected?: (
		regionKind: MapRegionKind,
		region: MapChipFilter,
	) => void;
}

export const SFov = (props: SFovProps): JSX.Element => {
	if (!isSFovThumbnailDisplayLevel()) return <></>;
	return (
		<Container>
			<SFovThumbnail
				onAutoSelectDefect={props.onAutoSelectDefect}
				onHoverRegionChange={props.onHoverRegionChange}
					onMapRegionClickStart={props.onMapRegionClickStart}
					onMapRegionSelected={props.onMapRegionSelected}
			/>
			<SFovBorder />
			<SelectedSFov />
		</Container>
	);
};
