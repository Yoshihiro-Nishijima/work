import { Toast } from "~/components/elements/Toast";
import { useMapNotification } from "../hooks/useMapNotification";

/**
 * Map表示上の警告通知表示用コンポーネント
 */
export const MapNotification = (): JSX.Element => {
	const { notification, resetNotification } = useMapNotification();

	return (
		<Toast
			message={notification.message}
			trigger={{
				isOpen: notification.isOpen,
				onClose: resetNotification,
			}}
			anchorOrigin={{ vertical: "top", horizontal: "center" }}
			severity="warning"
		/>
	);
};
