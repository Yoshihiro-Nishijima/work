import Square from "@mui/icons-material/Square";
import {
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Stack,
} from "@mui/material";

import { useDefectDisplay } from "~/features/display-setting/hooks/useDefectDisplay";

export const DefectDisplayList = (): JSX.Element => {
	const {
		defectDisplayRowList,
		selectedDefectDisplayNo,
		setSelectedDefectDisplayNo,
	} = useDefectDisplay();

	return (
		<Stack sx={{ width: "8em", Height: "100%" }}>
			<List dense>
				{defectDisplayRowList.map((defectDisplay, index) => (
					<ListItemButton
						divider
						key={defectDisplay.filterNo}
						selected={selectedDefectDisplayNo === index}
						onClick={() => {
							setSelectedDefectDisplayNo(index);
						}}
					>
						<ListItemIcon>
							<Square sx={{ color: defectDisplay.color }} />
						</ListItemIcon>
						<ListItemText primary={defectDisplay.name} />
					</ListItemButton>
				))}
			</List>
		</Stack>
	);
};
