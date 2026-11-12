import {
	type Dispatch,
	type SetStateAction,
	useCallback,
	useEffect,
	useState,
} from "react";
import type {
	Filter,
	Pagination,
	SearchParam,
	SearchResults,
	Sort,
} from "../types";

/** SearchResultで扱うデータの初期ソート設定 */
export const DEFAULT_SORT: Sort[] = [
	{
		field: "executionDate",
		direction: "desc",
	},
];

export const DEFAULT_PAGINATION: Pagination = {
	pageSize: 50,
	page: 0,
};

interface UseSearchResults<T> {
	total: number;
	datalist: T[];
	pagination: Pagination;
	setPagination: Dispatch<SetStateAction<Pagination>>;
	setSort: Dispatch<SetStateAction<Sort[]>>;
	setFilter: Dispatch<SetStateAction<Filter | undefined>>;
	searchResultFetchData: () => void;
}
export const useSearchResults = <T>(
	fetch: (param: SearchParam, signal: AbortSignal) => Promise<SearchResults<T>>,
	intervalMS = 10_000,
	defaultSort = DEFAULT_SORT,
	defaultPagination = DEFAULT_PAGINATION,
	defaultFilter?: Filter | undefined,
): UseSearchResults<T> => {
	const [datalist, setDataList] = useState<T[]>([]);
	const [total, setTotal] = useState(0);
	const [pagination, setPagination] = useState(defaultPagination);

	const [sort, setSort] = useState(defaultSort);
	const [filter, setFilter] = useState(defaultFilter);
	const [fetchControler, setFetchControler] = useState(new AbortController());

	// biome-ignore lint/correctness/useExhaustiveDependencies: fetchControlerは監視対象外(追加した場合は、常に呼ばれintervalが使用できないため)
	const searchResultFetchData = useCallback((): void => {
		fetch(
			{
				start: pagination.page * pagination.pageSize,
				limit: pagination.pageSize,
				sort,
				filter,
			},
			fetchControler.signal,
		)
			.then((res: SearchResults<T>) => {
				res.total != null && setTotal(res.total);
				setDataList(res.results);
			})
			.catch((error) => {
				if (error.name === "AbortError") return;
				console.error("searchResult fetch fail.", error);
			});
	}, [fetch, filter, pagination.page, pagination.pageSize, sort]);

	useEffect(() => {
		const controller = new AbortController();
		setFetchControler(controller);

		// 初回読み込み
		searchResultFetchData();

		// 2回目以降定期的に再取得
		const intervalId = setInterval(() => {
			searchResultFetchData();
		}, intervalMS);

		return () => {
			controller.abort();
			clearInterval(intervalId);
		};
	}, [intervalMS, searchResultFetchData]);

	return {
		total,
		datalist,
		pagination,
		setPagination,
		setSort,
		setFilter,
		searchResultFetchData,
	};
};
