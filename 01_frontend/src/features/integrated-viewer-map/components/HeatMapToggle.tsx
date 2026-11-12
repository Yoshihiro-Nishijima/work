import GradientIcon from "@mui/icons-material/Gradient";

import { MapViewToggle } from "./MapViewToggle";

interface HeatMapToggleProps {
	isSelected: boolean;
	onToggle: () => void;
}

export const HeatMapToggle = ({
	isSelected,
	onToggle,
}: HeatMapToggleProps): JSX.Element => (
	<MapViewToggle
		title="Show HeatMap"
		toggleIcon={<GradientIcon sx={{ mx: 0, p: 0 }} />}
		isSelected={isSelected}
		isDisabled={false}
		value="HeatMap"
		handleChangeToggleEvent={onToggle}
		sx={{
			margin: 0,
			height: 31,
			width: 160,
			whiteSpace: "nowrap",
			flexShrink: 0,
			justifyContent: "center",
			backgroundColor: "#fff",
			"&:hover": {
				backgroundColor: "#f5f5f5",
			},
			"&.Mui-selected": {
				backgroundColor: "#e3f2fd",
			},
			"&.Mui-selected:hover": {
				backgroundColor: "#e3f2fd",
			},
			"& > .MuiStack-root": {
				position: "relative",
				width: "100%",
				justifyContent: "center",
				"& > .MuiSvgIcon-root:first-of-type": {
					position: "absolute",
					left: "-6px",
				},
			},
		}}
	/>
);
