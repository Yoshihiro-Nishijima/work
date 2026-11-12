/** Defectクラス名の定義 */
export const CLASS_NAMES = [
	{ value: -1, label: "Unknown" },
	{ value: 0, label: "" },
	{ value: 1, label: "CAT1" },
	{ value: 2, label: "CAT2" },
	{ value: 3, label: "CAT3" },
	{ value: 4, label: "CAT4" },
	{ value: 5, label: "CAT5" },
	{ value: 6, label: "CAT6" },
	{ value: 7, label: "CAT7" },
	{ value: 8, label: "CAT8" },
	{ value: 9, label: "CAT9" },
	{ value: 10, label: "CAT10" },
];

/**
 * defectClassの値をクラス名に変換
 * @param defectClass defectClassの値
 * @returns クラス名(見つからない場合はUnknown)
 */
export const formatClassName = (
	defectClass: number | null | undefined,
): string => {
	if (defectClass == null) return CLASS_NAMES[0].label;
	const classItem = CLASS_NAMES.find((c) => c.value === defectClass);
	return classItem ? classItem.label : CLASS_NAMES[0].label;
};

/**
 * caughtByの値をDefectDisplay名に変換するファクトリ関数
 * @param defectDisplayList DefectDisplayのリスト
 * @returns caughtBy値を変換する関数
 */
export const createFormatCaughtBy = (defectDisplayList: { name: string }[]) => {
	return (caughtBy: number | null | undefined): string => {
		if (caughtBy == null || typeof caughtBy !== "number") return "";
		const index = caughtBy - 1;
		return index >= 0 && index < defectDisplayList.length
			? defectDisplayList[index].name
			: "";
	};
};
