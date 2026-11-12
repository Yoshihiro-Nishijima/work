import { atom, useAtom } from "jotai";
import { type Dispatch, type SetStateAction, useCallback } from "react";

import type {
	Filter,
	Pagination,
	Sort,
} from "~/components/types/DataGridTypes";
import type { DatasetDefect } from "~/features/adc-annotation/types";
import { getDatasetDefect } from "../api/getDatasetDefect";
import { useDataset } from "./useDataset";

const defectListAtom = atom<DatasetDefect[]>([]);

export const datasetNameAtom = atom("");

const totalAtom = atom(0);

const paginationAtom = atom<Pagination>({ pageSize: 10000, page: 0 });

const DEFAULT_SORT: Sort = {
	field: "datasetId",
	direction: "asc",
};

const sortAtom = atom([DEFAULT_SORT]);
export const filterAtom = atom<Filter | undefined>(undefined);

/** field名変換Map(K:GUI用field名,V:Server Query用field名) */
const fieldConvertMap: Record<string, string> = {
	defectClassName: "defectClass",
};

interface UseDatasetDefect {
	total: number;
	defectList: DatasetDefect[];
	sort: Sort[];
	filter: Filter | undefined;
	pagination: Pagination;
	setPagination: Dispatch<SetStateAction<Pagination>>;
	setSort: Dispatch<SetStateAction<Sort[]>>;
	setFilter: Dispatch<SetStateAction<Filter | undefined>>;
	setDatasetDefect: () => void;
}

const convertSortField = (sorts: Sort[]): Sort[] => {
	return sorts.map((sort) => ({
		...sort,
		field: fieldConvertMap[sort.field] || sort.field,
	}));
};

export const useDatasetDefect = (): UseDatasetDefect => {
	const [defectList, setDefectList] = useAtom(defectListAtom);
	const [total, setTotal] = useAtom(totalAtom);
	const [pagination, setPagination] = useAtom(paginationAtom);
	const [filter, setFilter] = useAtom(filterAtom);
	const { datasetName, datasetType } = useDataset();
	const [sort, setSort] = useAtom(sortAtom);

	const setDatasetDefect = useCallback(() => {
		if (datasetName.length === 0) return;
		const controller = new AbortController();
		const param = {
			start: pagination.page * pagination.pageSize,
			limit: pagination.pageSize,
			sort: convertSortField(sort),
			filter,
		};
		getDatasetDefect(datasetType, datasetName, param, controller.signal)
			.then((res) => {
				res.total != null && setTotal(res.total);
				res.results != null && setDefectList(res.results);
			})
			.catch((error) => {
				if (error.name === "AbortError") return;
				console.error("getDatasetDefect fetch fail.", error);
			});
		return () => {
			controller.abort();
		};
	}, [
		datasetType,
		datasetName,
		pagination,
		sort,
		filter,
		setTotal,
		setDefectList,
	]);

	return {
		defectList,
		total,
		sort,
		filter,
		pagination,
		setPagination,
		setSort,
		setFilter,
		setDatasetDefect,
	};
};
