import type { Theme } from "@emotion/react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Grid,
	type SxProps,
	Typography,
} from "@mui/material";
import { useEffect, useRef } from "react";

import { Spacing } from "~/components/elements";
import { useSelectedChipValue } from "~/features/misc/hooks/useMapSelectionStatus";

import { ChipMap, MFovMap, SFovMap, WaferMap } from "../components";
import { useMapAreaSize } from "../hooks/useMapAreaSize";

export const MapArea = (): JSX.Element => {
	const selectedChip = useSelectedChipValue();
	const { mapAreaWidth, mapAreaHeight, calcAndSetMapAreaHeight } =
		useMapAreaSize();

	const panelRef = useRef<HTMLDivElement>(null);

	const summaryHeight = 24;

	const isWaferMapExpanded = useRef(true);
	const isSFovMapExpanded = useRef(true);
	const setMapAreaHeight = (): void => {
		if (panelRef.current == null) return;
		calcAndSetMapAreaHeight(
			panelRef.current.offsetHeight,
			summaryHeight * 4,
			getOpendedMapNum(),
		);
	};
	const getOpendedMapNum = (): number => {
		let num = 2;
		if (isSFovMapExpanded.current) num += 1;
		if (isWaferMapExpanded.current) num += 1;
		return num;
	};
	const handleWaferMapAccordionChange = (
		_event: React.SyntheticEvent,
		expanded: boolean,
	): void => {
		isWaferMapExpanded.current = expanded;
		setMapAreaHeight();
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
	const closedStyle = {
		width: "100%",
		boxShadow: "none",
		flexGrow: summaryHeight,
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

	// biome-ignore lint/correctness/useExhaustiveDependencies: 初回のみ行う
	useEffect(() => {
		setMapAreaHeight();
	}, []);
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
			<Accordion
				sx={isWaferMapExpanded.current ? expandedStyle : closedStyle}
				disableGutters
				defaultExpanded
				onChange={handleWaferMapAccordionChange}
			>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
					aria-controls="wafer-map-content"
					id="wafer-map-header"
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
					<Grid container sx={summaryVisibleSxProp(200)}>
						<Grid item xs={6}>
							<Typography ml={2}>Wafer Map</Typography>
						</Grid>
						<Grid
							item
							xs={6}
							sx={{
								display: "flex",
								justifyContent: "flex-end",
								alignItems: "center",
							}}
						>
							<Typography ml={2}>
								Chip:{selectedChip?.x}, {selectedChip?.y}
							</Typography>
							<Spacing mx={1} />
						</Grid>
					</Grid>
				</AccordionSummary>
				<AccordionDetails sx={{ padding: 0 }}>
					<WaferMap mapAreaWidth={mapAreaWidth} mapAreaHeight={mapAreaHeight} />
				</AccordionDetails>
			</Accordion>
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
					<ChipMap mapAreaWidth={mapAreaWidth} mapAreaHeight={mapAreaHeight} />
				</AccordionDetails>
			</Accordion>

			<Accordion sx={expandedStyle} disableGutters defaultExpanded expanded>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon sx={{ color: "primary.main" }} />}
					aria-controls="mfov-map-content"
					id="mfov-map-header"
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
						mFOV Map
					</Typography>
				</AccordionSummary>
				<AccordionDetails sx={{ padding: 0 }}>
					<MFovMap mapAreaWidth={mapAreaWidth} mapAreaHeight={mapAreaHeight} />
				</AccordionDetails>
			</Accordion>

			<Accordion
				sx={isWaferMapExpanded.current ? expandedStyle : closedStyle}
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
					<SFovMap mapAreaWidth={mapAreaWidth} mapAreaHeight={mapAreaHeight} />
				</AccordionDetails>
			</Accordion>
		</div>
	);
};
