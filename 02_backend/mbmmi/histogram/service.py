from mbmmi.db.query import FilterItem

from .calculation import HistogramCalculationService
from .models import (
    DefectHistogramRangeResponse,
    DefectHistogramResponse,
    HistogramCategory,
    HistogramRangeCategory,
    HistogramRangeCounts,
)
from .providers.base import DefectHistogramDataProvider
from .registry import get_histogram_field


def validate_filter(field: str, filter_item: object | None) -> FilterItem | None:
    field_definition = get_histogram_field(field)
    if not field_definition.histogram_target:
        raise ValueError(f"unsupported histogram field: {field}")
    if filter_item is None:
        return None
    if not isinstance(filter_item, FilterItem):
        raise ValueError("filter must be a valid FilterItem")
    if filter_item.field != field:
        raise ValueError("filter field must match histogram field")
    filter_definition = get_histogram_field(filter_item.field)
    if not filter_definition.filter_target:
        raise ValueError(f"unsupported filter field: {filter_item.field}")
    if filter_item.operator not in filter_definition.allowed_operators:
        raise ValueError(f"unsupported filter operator: {filter_item.operator}")
    normalized_value = filter_item.value
    if filter_item.operator not in {"isEmpty", "isNotEmpty"}:
        if normalized_value is None or normalized_value == "":
            raise ValueError("filter value is required")
        is_list_operator = filter_item.operator == "isAnyOf"
        if is_list_operator != isinstance(normalized_value, list):
            raise ValueError("filter value type does not match operator")
        values = normalized_value if is_list_operator else [normalized_value]
        numeric_values = [filter_definition.normalize_value(value) for value in values]
        normalized_value = numeric_values if is_list_operator else numeric_values[0]
    return filter_item.model_copy(
        update={
            "field": filter_definition.database_field,
            "value": normalized_value,
        }
    )


class DefectHistogramService:
    def __init__(self, provider: DefectHistogramDataProvider):
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
