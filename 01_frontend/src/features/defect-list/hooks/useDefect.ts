import type {
	GridColumnVisibilityModel,
	GridFilterModel,
} from "@mui/x-data-grid-pro";
import { atom, useAtom, useSetAtom } from "jotai";
import { loadable, useAtomCallback } from "jotai/utils";
import {
	type Dispatch,
	type SetStateAction,
	useCallback,
	useMemo,
} from "react";

import type { DefectRecord } from "~/features/defect-list/types";
import type { Filter, Pagination, Sort } from "~/features/job-manager-info/types";
import { useResultName } from "~/features/misc/hooks/useResultName";
import {
	toPagingQueryParam,
	toSQLFilter,
} from "~/features/misc/types/pagingQueryParam";

import { getDefect } from "../api/getDefect";
import { DefectViewColumns } from "../components/DefectViewColumns";

/** Defectリスト */
const defectListAtom = atom<DefectRecord[]>([]);

/** Mapエリア表示Defectのフィルタ用 フィルタ文字列Selector
 * フィルタ未指定時は undefined を返す
 * useMapDefectsInfoから参照するので export
 */
export const filterQuerySelector = atom((get) => {
	const filter = get(filterAtom);
	if (filter == null || filter.items.length === 0) return undefined;
	return toPagingQueryParam(
		undefined,
		[],
		toSQLFilter(convertFilterField(filter), DefectViewColumns([])),
	);
});

const totalAtom = atom(0);

const paginationAtom = atom<Pagination>({ pageSize: 10000, page: 0 });

export interface MapChipFilter {
	chipX: number;
	chipY: number;
	mFOVno?: number;
	sFOVno?: number;
}

export const mapChipFilterAtom = atom<MapChipFilter | null>(null);

export const categoryDefectClassAtom = atom<number | null>(null);

const setCategoryDefectClassAtom = atom(
	null,
	(get, set, defectClass: number | null) => {
		if (get(categoryDefectClassAtom) === defectClass) return;

		set(categoryDefectClassAtom, defectClass);
		set(paginationAtom, (currentPagination) => ({
			...currentPagination,
			page: 0,
		}));
	},
);

export const useSetCategoryDefectClass = () =>
	useSetAtom(setCategoryDefectClassAtom);

const setMapChipFilterAtom = atom(
	null,
	(get, set, nextFilter: MapChipFilter | null) => {
		const currentFilter = get(mapChipFilterAtom);
		if (
			currentFilter?.chipX === nextFilter?.chipX &&
			currentFilter?.chipY === nextFilter?.chipY &&
			currentFilter?.mFOVno === nextFilter?.mFOVno &&
			currentFilter?.sFOVno === nextFilter?.sFOVno
		) {
			return;
		}

		set(mapChipFilterAtom, nextFilter);
		set(paginationAtom, (currentPagination) => ({
			...currentPagination,
			page: 0,
		}));
	},
);

export const useSetMapChipFilter = () => useSetAtom(setMapChipFilterAtom);

const sortAtom = atom<Sort[]>([]);

const columnVisibilityModelAtom = atom<GridColumnVisibilityModel | undefined>(
	undefined,
);

export const useDefectColumnVisibilityModel = () => {
	const [columnVisibilityModel, setColumnVisibilityModel] = useAtom(
		columnVisibilityModelAtom,
	);
	return { columnVisibilityModel, setColumnVisibilityModel };
};

export const filterAtom = atom<GridFilterModel | undefined>(undefined);

const combineMapChipFilter = (
	filter: Filter | undefined,
	mapChipFilter: MapChipFilter | null,
): Filter | undefined => {
	if (mapChipFilter == null) return filter;

	return {
		items: [
			...(filter?.items ?? []),
			{ field: "chipX", operator: "=", value: mapChipFilter.chipX },
			{ field: "chipY", operator: "=", value: mapChipFilter.chipY },
			...(mapChipFilter.mFOVno == null
				? []
				: [{ field: "mFOVno", operator: "=", value: mapChipFilter.mFOVno }]),
			...(mapChipFilter.sFOVno == null
				? []
				: [{ field: "sFOVno", operator: "=", value: mapChipFilter.sFOVno }]),
		],
		logicOperator: "and",
	};
};

/** field名変換Map(K:GUI用field名,V:Server Query用field名) */
const fieldConvertMap: Record<string, string> = {
	defectClassName: "defectClass",
};

interface UseDefect {
	total: number;
	defectList: DefectRecord[];
	sort: Sort[];
	filter: GridFilterModel | undefined;
	pagination: Pagination;
	setPagination: Dispatch<SetStateAction<Pagination>>;
	setSort: Dispatch<SetStateAction<Sort[]>>;
	setFilter: Dispatch<SetStateAction<GridFilterModel | undefined>>;
	setDefect: () => void;
}

interface UseGetDefect {
	getDefectById: (defectId: number) => DefectRecord | undefined;
}

// Defect情報取得用カスタムフック
// TODO 他のカスタムフックと同様に、設定用の useSetDefect と 取得用の useDefect とする予定なので名前は暫定
export const useGetDefect = (): UseGetDefect => {
	const asyncDefectListAtom = useMemo(
		() => atom(async (get) => get(defectListAtom)),
		[],
	);
	const loadableDefectListAtom = loadable(asyncDefectListAtom);
	const [loadableDefectListValue] = useAtom(loadableDefectListAtom);
	const getDefectById = useAtomCallback(
		useCallback(
			(_get, _set, defectId: number): DefectRecord | undefined => {
				// 事前取得ではタイミングによっては取得できないため、比較時に取得
				if (
					loadableDefectListValue.state === "loading" ||
					loadableDefectListValue.state === "hasError"
				)
					return undefined;
				return loadableDefectListValue.data?.find(
					(d: DefectRecord) => d.defectId === defectId,
				);
			},
			[loadableDefectListValue],
		),
	);

	return { getDefectById };
};

const convertFilterField = (
	model?: GridFilterModel,
): GridFilterModel | undefined => {
	if (model == null) return undefined;
	return {
		...model,
		items: model.items.map((item) => ({
			...item,
			field: fieldConvertMap[item.field] || item.field,
		})),
	};
};

export const convertDefectFilter = (
	model?: GridFilterModel,
): Filter | undefined => {
	return toSQLFilter(convertFilterField(model), DefectViewColumns([]));
};

const convertSortField = (sorts: Sort[]): Sort[] => {
	return sorts.map((sort) => ({
		...sort,
		field: fieldConvertMap[sort.field] || sort.field,
	}));
};

interface DefectQueryOptions {
	pagination: Pagination;
	sort: Sort[];
	filter?: GridFilterModel;
	mapChipFilter: MapChipFilter | null;
	defectClass?: number;
}

export const buildDefectQuery = ({
	pagination,
	sort,
	filter,
	mapChipFilter,
	defectClass,
}: DefectQueryOptions): string => {
	const convertedFilter = convertDefectFilter(filter);
	const categoryFilter =
		defectClass == null
			? convertedFilter
			: {
					items: [
						...(convertedFilter?.items ?? []),
						{ field: "defectClass", operator: "=", value: defectClass },
					],
					logicOperator: "and" as const,
				};

	return toPagingQueryParam(
		pagination,
		convertSortField(sort),
		combineMapChipFilter(categoryFilter, mapChipFilter),
	);
};

export const useDefect = (options?: { defectClass?: number | null }): UseDefect => {
	const [defectList, setDefectList] = useAtom(defectListAtom);
	const [total, setTotal] = useAtom(totalAtom);
	const [sort, setSort] = useAtom(sortAtom);
	const [pagination, setPagination] = useAtom(paginationAtom);
	const [filter, setFilter] = useAtom(filterAtom);
	const [mapChipFilter] = useAtom(mapChipFilterAtom);
	const { resultName } = useResultName();

	const setDefect = useCallback(() => {
		if (resultName.length === 0) return;
		const controller = new AbortController();
		const query = buildDefectQuery({
			pagination,
			sort,
			filter,
			mapChipFilter,
			defectClass: options?.defectClass ?? undefined,
		});
		getDefect(resultName, query, controller.signal)
			.then((res) => {
				res.total != null && setTotal(res.total);
				res.defects != null && setDefectList(res.defects);
			})
			.catch((error) => {
				if (error.name === "AbortError") return;
				console.error("getDefect fetch fail.", error);
			});
		return () => {
			controller.abort();
		};
	}, [
		resultName,
		pagination,
		sort,
		filter,
		mapChipFilter,
		options?.defectClass,
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
		setDefect,
	};
};
