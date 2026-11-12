export function randomId(): string {
	const randHex = (): string =>
		`0000${Math.floor(Math.random() * 0xffff).toString(16)}`.slice(-4);
	return `${
		randHex() + randHex()
	}-${randHex()}-${randHex()}-${randHex()}${randHex()}${randHex()}`;
}

/**
 * Unixパスか検証する（ハイフンとアンダースコアを許容）
 */
export const isUnixPath = (str: string): boolean => {
	return /^\/[\w-]+(?:\/[\w-]+)*\/?$/i.test(str);
};

/**
 * Windowsパスか検証する（ハイフンとアンダースコアを許容）
 */
export const isWindowsPath = (str: string): boolean => {
	return /^[a-z]:\\(?:[\w-]+\\)*[\w-]+\\?$/i.test(str);
};

/**
 * IPv4アドレスか検証する
 */
export const isIPv4 = (str: string): boolean => {
	const regex =
		/^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])$/;
	return regex.test(str);
};

/**
 * 16進カラーコード(#RRGGBB形式)か検証する
 */
export const isHexColor = (str: string): boolean => {
	const regex = /^#[0-9a-fA-F]{6}$/;
	return regex.test(str);
};

/**
 * ファイルパスで使用可能な文字（半角英数字、_、-、/、\、:）
 */
export const ALLOWED_PATH_CHAR_REGEX = /^[a-zA-Z0-9_\\\/:-]$/;

/**
 * IPv4アドレスで使用可能な文字（0-9, .）
 */
export const ALLOWED_IPV4_CHAR_REGEX = /^[0-9.]$/;

/**
 * ServerNameで使用可能な文字（半角英数字、_、-）
 */
export const ALLOWED_SERVER_NAME_CHAR_REGEX = /^[a-zA-Z0-9_-]$/;

/**
 * DefectDisplayNameで使用可能な文字（半角英数字、_、-）
 */
export const ALLOWED_DEFECT_DISPLAY_NAME_CHAR_REGEX = /^[a-zA-Z0-9_-]$/;

/**
 * 16進カラーコードで使用可能な文字（#, 0-9, A-F, a-f）
 */
export const ALLOWED_HEX_COLOR_CHAR_REGEX = /^[#A-Fa-f0-9]$/;
