import InfoOutlined from "@mui/icons-material/InfoOutlined";
import { ListItemIcon, ListItemText, MenuItem } from "@mui/material";
import { useState } from "react";
import { AboutDialog } from "./AboutDialog";

interface AboutProp {
	setIsMenuOpen: (isMenuOpen: boolean) => void;
}

export const About = (prop: AboutProp): JSX.Element => {
	const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false);

	const handleClickAbout = (): void => {
		setIsAboutDialogOpen(true);
	};

	const setIsAboutOpen = (isAboutDialogOpen: boolean): void => {
		setIsAboutDialogOpen(isAboutDialogOpen);
		prop.setIsMenuOpen(isAboutDialogOpen);
	};
	return (
		<>
			<MenuItem onClick={handleClickAbout}>
				<ListItemIcon>
					<InfoOutlined />
				</ListItemIcon>
				<ListItemText>About</ListItemText>
			</MenuItem>
			{isAboutDialogOpen && (
				<AboutDialog
					isAboutDialogOpen={isAboutDialogOpen}
					setIsAboutDialogOpen={setIsAboutOpen}
				/>
			)}
		</>
	);
};
