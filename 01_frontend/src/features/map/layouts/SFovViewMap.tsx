import type { Theme } from "@emotion/react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Box,
	type SxProps,
	Typography,
} from "@mui/material";
import { useRef } from "react";

import { TitleBar } from "~/components/elements";
import { ChipMap, MFovMap, SFovMap } from "../components";
import { useMapAreaSize } from "../hooks/useMapAreaSize";

export const SFovViewMap = (): JSX.Element => {
	const {
		mapAreaWidth,
		mapAreaHeight,
		setMapAreaWidth,
		calcAndSetMapAreaHeight,
	} = useMapAreaSize();
	const panelRef = useRef<HTMLDivElement>(null);

	const summaryHeight = 24;
	const sFovViewMapAreaWidth = 200;

	const isSFovMapExpanded = useRef(true);

	const initializedMapAreaHeight = useRef(false);

	if (mapAreaWidth !== sFovViewMapAreaWidth) {
		setMapAreaWidth(sFovViewMapAreaWidth);
	}
	const setMapAreaHeight = (): void => {
		if (panelRef.current == null) return;
		calcAndSetMapAreaHeight(
			panelRef.current.offsetHeight,
			summaryHeight * 3,
			!isSFovMapExpanded.current ? 2 : 3,
		);
	};

	const handleSFovMapAccordionChange = (
		_event: React.SyntheticEvent,
		expanded: boolean,
	): void => {
		isSFovMapExpanded.current = expanded;
		setMapAreaHeight();
	};

	const expandedStyle = {
		width: "100%",
		boxShadow: "none",
		flexGrow: mapAreaHeight,
	};

	const summaryVisibleSxProp = (minWidth = 200): SxProps<Theme> => {
		if (
			panelRef.current?.offsetWidth == null ||
			panelRef.current?.offsetWidth > minWidth
		) {
			return { visibility: "visible" };
		}
		return { visibility: "hidden" };
	};

	if (panelRef.current != null && !initializedMapAreaHeight.current) {
		// MapエリアのPanelサイズ確定後に1回だけセットする
		setMapAreaHeight();
		initializedMapAreaHeight.current = true;
	}

	return (
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
			}}
			ref={panelRef}
		>
			<Accordion sx={expandedStyle} disableGutters defaultExpanded expanded>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon sx={{ color: "primary.main" }} />}
					aria-controls="chip-map-content"
					id="chip-map-header"
					sx={{
						width: "100%",
						minHeight: summaryHeight,
						maxHeight: summaryHeight,
						color: "white",
						backgroundColor: "primary.main",
						borderTopStyle: "solid",
						borderTopColor: "primary.dark",
						paddingLeft: "0px",
					}}
				>
					<Typography ml={2} sx={summaryVisibleSxProp(150)}>
						Chip Map
					</Typography>
				</AccordionSummary>
				<AccordionDetails sx={{ padding: 0 }}>
					<Box sx={{ height: "100%", width: "100%" }}>
						<ChipMap
							mapAreaWidth={mapAreaWidth}
							mapAreaHeight={mapAreaHeight}
						/>
					</Box>
				</AccordionDetails>
			</Accordion>

			<TitleBar title={"mFOV Map"} sx={{ height: summaryHeight }} />
			<Box sx={{ height: mapAreaWidth }}>
				<MFovMap mapAreaWidth={mapAreaWidth} mapAreaHeight={mapAreaHeight} />
			</Box>

			<Accordion
				sx={expandedStyle}
				disableGutters
				defaultExpanded
				onChange={handleSFovMapAccordionChange}
			>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
					aria-controls="sfov-map-content"
					id="sfov-map-header"
					sx={{
						width: "100%",
						minHeight: summaryHeight,
						maxHeight: summaryHeight,
						color: "white",
						backgroundColor: "primary.main",
						borderTopStyle: "solid",
						borderTopColor: "primary.dark",
						paddingLeft: "0px",
					}}
				>
					<Typography ml={2} sx={summaryVisibleSxProp(150)}>
						sFOV Map
					</Typography>
				</AccordionSummary>
				<AccordionDetails sx={{ padding: 0 }}>
					<Box sx={{ height: "100%", width: "100%" }}>
						<SFovMap
							mapAreaWidth={mapAreaWidth}
							mapAreaHeight={mapAreaHeight}
						/>
					</Box>
				</AccordionDetails>
			</Accordion>
		</div>
	);
};
