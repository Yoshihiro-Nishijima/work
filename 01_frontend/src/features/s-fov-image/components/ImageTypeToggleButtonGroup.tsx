import { ToggleButton, ToggleButtonGroup } from "@mui/material";

interface ImageTypeToggleButtonGroupProp {
	hasReferences: boolean;
	showSEMType: string;
	setShowSEM: (showSEM: string) => void;
}

export const ImageTypeToggleButtonGroup = ({
	hasReferences,
	showSEMType,
	setShowSEM,
}: ImageTypeToggleButtonGroupProp): JSX.Element => {
	if (!hasReferences) return <></>;

	return (
		<ToggleButtonGroup
			color="primary"
			exclusive
			size="small"
			value={showSEMType}
			onChange={(_, value) => setShowSEM(value)}
		>
			<ToggleButton value="target">Target</ToggleButton>
			<ToggleButton value="ref1">Reference 1</ToggleButton>
			<ToggleButton value="ref2">Reference 2</ToggleButton>
		</ToggleButtonGroup>
	);
};
