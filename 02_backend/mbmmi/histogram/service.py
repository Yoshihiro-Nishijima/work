import math

from mbmmi.db.query import FilterItem

from .calculation import HistogramCalculationService
from .models import (
    DefectHistogramRangeResponse,
    DefectHistogramResponse,
    HistogramCategory,
    HistogramRangeCategory,
    HistogramRangeCounts,
)
from .providers.result import ResultDefectHistogramProvider
from .registry import ALLOWED_OPERATORS, get_histogram_field


def validate_filter(field: str, filter_item: object | None) -> FilterItem | None:
    get_histogram_field(field)
    if filter_item is None:
        return None
    if not isinstance(filter_item, FilterItem):
        raise ValueError("filter must be a valid FilterItem")
    filter_definition = get_histogram_field(filter_item.field)
    if filter_item.operator not in ALLOWED_OPERATORS:
        raise ValueError(f"unsupported filter operator: {filter_item.operator}")
    normalized_value = filter_item.value
    if filter_item.operator not in {"isEmpty", "isNotEmpty"}:
        if normalized_value is None or normalized_value == "":
            raise ValueError("filter value is required")
        is_list_operator = filter_item.operator == "isAnyOf"
        if is_list_operator != isinstance(normalized_value, list):
            raise ValueError("filter value type does not match operator")
        values = normalized_value if is_list_operator else [normalized_value]
        numeric_values: list[float] = []
        for value in values:
            try:
                number = float(value)
            except (TypeError, ValueError, OverflowError) as exc:
                raise ValueError("filter value must be numeric and finite") from exc
            if not math.isfinite(number):
                raise ValueError("filter value must be numeric and finite")
            numeric_values.append(number)
        normalized_value = numeric_values if is_list_operator else numeric_values[0]
    return filter_item.model_copy(
        update={
            "field": filter_definition.database_field,
            "value": normalized_value,
        }
    )


class DefectHistogramService:
    def __init__(self, provider: ResultDefectHistogramProvider):
        self._provider = provider

    def calculate(
        self, field: str, filter_item: FilterItem | None
    ) -> DefectHistogramResponse:
        normalized_filter = validate_filter(field, filter_item)
        matched_count, values, categories = self._provider.fetch(field, normalized_filter)
        result = HistogramCalculationService.calculate(values, categories, matched_count)
        return DefectHistogramResponse(
            dataMin=result.data_min,
            dataMax=result.data_max,
            edges=result.edges,
            counts=result.counts,
            categories=[
                HistogramCategory(categoryNo=category, counts=counts)
                for category, counts in result.categories
            ],
            matchedCount=result.matched_count,
            numericValueCount=result.numeric_value_count,
        )

    def calculate_range(
        self,
        field: str,
        filter_item: FilterItem | None,
        lower: float,
        upper: float,
    ) -> DefectHistogramRangeResponse:
        normalized_filter = validate_filter(field, filter_item)
        matched_count, values, categories = self._provider.fetch(field, normalized_filter)
        result = HistogramCalculationService.calculate_range(
            values, categories, lower, upper, matched_count
        )
        return DefectHistogramRangeResponse(
            counts=HistogramRangeCounts(
                left=result.counts[0],
                selected=result.counts[1],
                right=result.counts[2],
            ),
            categories=[
                HistogramRangeCategory(
                    categoryNo=category,
                    counts=HistogramRangeCounts(
                        left=counts[0],
                        selected=counts[1],
                        right=counts[2],
                    ),
                )
                for category, counts in result.categories
            ],
            matchedCount=result.matched_count,
            numericValueCount=result.numeric_value_count,
        )
