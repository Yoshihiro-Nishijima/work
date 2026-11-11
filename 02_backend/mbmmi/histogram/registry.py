import math
from collections.abc import Callable
from dataclasses import dataclass
from typing import Final

from sqlalchemy import Column

from mbmmi.result.image import Defect

NumericNormalizer = Callable[[object], float]

NUMERIC_FILTER_OPERATORS: Final[frozenset[str]] = frozenset(
    {"=", "!=", "<", "<=", ">", ">=", "isEmpty", "isNotEmpty", "isAnyOf"}
)


def normalize_finite_number(value: object) -> float:
    try:
        number = float(value)
    except (TypeError, ValueError, OverflowError) as exc:
        raise ValueError("filter value must be numeric and finite") from exc
    if not math.isfinite(number):
        raise ValueError("filter value must be numeric and finite")
    return number


@dataclass(frozen=True)
class HistogramField:
    field: str
    database_field: str
    data_type: str
    request_value_type: str
    histogram_target: bool
    filter_target: bool
    normalize_value: NumericNormalizer
    allowed_operators: frozenset[str]


def _numeric_field(field: str, database_field: str) -> HistogramField:
    return HistogramField(
        field=field,
        database_field=database_field,
        data_type="number",
        request_value_type="finite-number",
        histogram_target=True,
        filter_target=True,
        normalize_value=normalize_finite_number,
        allowed_operators=NUMERIC_FILTER_OPERATORS,
    )


HISTOGRAM_FIELDS: Final[dict[str, HistogramField]] = {
    field: _numeric_field(field, database_field)
    for field, database_field in {
        "defectId": "defectId",
        "abnormality": "abnormality",
        "width": "sizeX",
        "height": "sizeY",
        "gray": "gray",
        "grayDiff": "grayDiff",
        "area": "area",
        "mFOVno": "mFOVno",
        "sFOVno": "sFOVno",
        "chipX": "chipX",
        "chipY": "chipY",
        "coordX": "coordX",
        "coordY": "coordY",
    }.items()
}


def get_histogram_field(field: str) -> HistogramField:
    try:
        return HISTOGRAM_FIELDS[field]
    except KeyError as exc:
        raise ValueError(f"unsupported histogram field: {field}") from exc


def get_database_column(field: str) -> Column:
    definition = get_histogram_field(field)
    column = Defect.__table__.c.get(definition.database_field)
    if column is None:
        raise ValueError(f"histogram database field is unavailable: {field}")
    return column
