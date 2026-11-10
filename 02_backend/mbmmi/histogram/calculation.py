import math
from collections import defaultdict
from collections.abc import Iterable
from dataclasses import dataclass


@dataclass(frozen=True)
class HistogramData:
    data_min: float | None
    data_max: float | None
    edges: list[float]
    counts: list[int]
    categories: list[tuple[int, list[int]]]
    matched_count: int
    numeric_value_count: int


@dataclass(frozen=True)
class RangeData:
    counts: tuple[int, int, int]
    categories: list[tuple[int, tuple[int, int, int]]]
    matched_count: int
    numeric_value_count: int


def normalize_category(category: object) -> int:
    if category is None:
        return -1
    try:
        number = int(category)
    except (TypeError, ValueError, OverflowError):
        return -1
    return number if 0 <= number <= 10 else -1


def _finite_values(values: Iterable[object]) -> list[float]:
    result: list[float] = []
    for value in values:
        try:
            number = float(value)
        except (TypeError, ValueError, OverflowError):
            continue
        if math.isfinite(number):
            result.append(number)
    return result


class HistogramCalculationService:
    @staticmethod
    def calculate(
        values: Iterable[object],
        categories: Iterable[object],
        matched_count: int,
    ) -> HistogramData:
        input_values = list(values)
        input_categories = list(categories)
        numeric_values = _finite_values(input_values)
        numeric_value_count = len(numeric_values)
        if not numeric_values:
            return HistogramData(
                None,
                None,
                [],
                [],
                [],
                matched_count,
                0,
            )

        data_min = min(numeric_values)
        data_max = max(numeric_values)
        if data_min == data_max:
            edges = [data_min, data_max]
            counts = [numeric_value_count]
        else:
            bin_count = max(10, min(100, round(math.sqrt(numeric_value_count))))
            width = (data_max - data_min) / bin_count
            edges = [data_min + width * index for index in range(bin_count + 1)]
            edges[-1] = data_max
            counts = [0] * bin_count
            for value in numeric_values:
                index = min(int((value - data_min) / width), bin_count - 1)
                counts[index] += 1

        category_counts: defaultdict[int, list[int]] = defaultdict(
            lambda: [0] * len(counts)
        )
        for value, category in zip(input_values, input_categories, strict=False):
            try:
                number = float(value)
            except (TypeError, ValueError, OverflowError):
                continue
            if not math.isfinite(number):
                continue
            index = (
                0
                if data_min == data_max
                else min(int((number - data_min) / (edges[1] - edges[0])), len(counts) - 1)
            )
            category_counts[normalize_category(category)][index] += 1

        ordered_categories = sorted(category_counts.items(), key=lambda item: item[0])
        return HistogramData(
            data_min,
            data_max,
            edges,
            counts,
            ordered_categories,
            matched_count,
            numeric_value_count,
        )

    @staticmethod
    def calculate_range(
        values: Iterable[object],
        categories: Iterable[object],
        lower: float,
        upper: float,
        matched_count: int,
    ) -> RangeData:
        total = [0, 0, 0]
        category_counts: defaultdict[int, list[int]] = defaultdict(lambda: [0, 0, 0])
        numeric_value_count = 0
        for value, category in zip(values, categories, strict=False):
            try:
                number = float(value)
            except (TypeError, ValueError, OverflowError):
                continue
            if not math.isfinite(number):
                continue
            numeric_value_count += 1
            index = 0 if number < lower else 2 if number > upper else 1
            total[index] += 1
            category_counts[normalize_category(category)][index] += 1

        return RangeData(
            tuple(total),
            sorted(
                ((category, tuple(counts)) for category, counts in category_counts.items()),
                key=lambda item: item[0],
            ),
            matched_count,
            numeric_value_count,
        )
