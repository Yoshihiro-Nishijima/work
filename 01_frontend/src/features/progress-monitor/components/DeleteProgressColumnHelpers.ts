import { toSizeStr } from "~/utils/formatter";
import type { DeleteProgressInfo } from "../types";

/**
 * Result/ToolData判定
 * nameが存在すればResult、空文字列ならToolData
 */
export const getDeleteType = (row: DeleteProgressInfo): string => {
	return row.name ? "Result" : "ToolData";
};

/**
 * Result行のみのフィールド値を取得（ToolData行では undefined を返す）
 */
export const getStatusForResult = (
	row: DeleteProgressInfo,
): number | undefined => {
	return row.name ? row.status : undefined;
};

export const getReExecutedForResult = (
	row: DeleteProgressInfo,
): number | undefined => {
	return row.name ? row.reExecuted : undefined;
};

/**
 * Result行のみのフィールド値を取得（ToolData行では "-" を返す）
 */
export const getJobTypeOrDefault = (row: DeleteProgressInfo): string => {
	return row.name ? row.jobType : "-";
};

export const getProcessTimeOrDefault = (
	row: DeleteProgressInfo,
): number | string => {
	return row.name ? row.processTime : "-";
};

export const getErrorOrDefault = (row: DeleteProgressInfo): string => {
	return row.name ? row.error : "-";
};

export const getNameOrDefault = (row: DeleteProgressInfo): string => {
	return row.name || "-";
};

export const getDiskSizeOrDefault = (row: DeleteProgressInfo): string => {
	return row.name ? toSizeStr(row.diskSize) : "-";
};
