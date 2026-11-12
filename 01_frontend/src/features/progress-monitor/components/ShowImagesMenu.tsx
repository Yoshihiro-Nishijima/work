import { MenuItem } from "@mui/material";
import { PROGRESS_MONITOR_URL } from "config";

import { useJobProgressInfo } from "../hooks/useJobProgressInfo";

interface MenuProps {
	onClose?: () => void;
}

export const ShowImagesMenu = ({ onClose }: MenuProps): JSX.Element => {
	const { selectedJobProgress } = useJobProgressInfo();
	const disabled = !selectedJobProgress?.name;
	const handleShowImages = (): void => {
		onClose?.();
		!disabled && window.open(PROGRESS_MONITOR_URL + selectedJobProgress.name);
	};
	return (
		<MenuItem disabled={disabled} onClick={handleShowImages}>
			SHOW IMAGES
		</MenuItem>
	);
};
