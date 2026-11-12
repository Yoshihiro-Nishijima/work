import { MenuItem } from "@mui/material";
import { useJobProgressInfo } from "../hooks/useJobProgressInfo";

interface MenuProps {
	onClose?: () => void;
}

export const CancelMenu = ({ onClose }: MenuProps): JSX.Element => {
	const { cancelable, cancel } = useJobProgressInfo();
	const handleClick = async (): Promise<void> => {
		await cancel();
		onClose?.();
	};
	return (
		<MenuItem disabled={!cancelable} onClick={handleClick}>
			Cancel
		</MenuItem>
	);
};
