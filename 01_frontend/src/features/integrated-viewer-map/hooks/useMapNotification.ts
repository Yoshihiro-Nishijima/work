import { atom, useAtomValue } from "jotai";
import { atomWithReset, useResetAtom } from "jotai/utils";

/**
 * Map表示上の警告通知表示用Atom管理
 */

interface Notification {
	isOpen: boolean;
	message: string;
}

const mapNotificationAtom = atomWithReset<Notification>({
	isOpen: false,
	message: "",
});

export const mapNotificationSetterAtom = atom(
	null,
	(get, set, message: string) => {
		// message未指定または既に設定済みならなにもしない
		if (!message || get(mapNotificationAtom).message) return;
		set(mapNotificationAtom, { isOpen: true, message });
	},
);

interface UseMapNotification {
	notification: Notification;
	resetNotification: () => void;
}

export const useMapNotification = (): UseMapNotification => {
	return {
		notification: useAtomValue(mapNotificationAtom),
		resetNotification: useResetAtom(mapNotificationAtom),
	};
};
