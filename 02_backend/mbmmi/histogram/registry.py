from dataclasses import dataclass
from typing import Final

from sqlalchemy import Column

from mbmmi.result.image import Defect


@dataclass(frozen=True)
class HistogramField:
    field: str
    database_field: str
    data_type: str
    histogram_target: bool = True
    filter_target: bool = True


HISTOGRAM_FIELDS: Final[dict[str, HistogramField]] = {
    "defectId": HistogramField("defectId", "defectId", "number"),
    "abnormality": HistogramField("abnormality", "abnormality", "number"),
    "width": HistogramField("width", "sizeX", "number"),
    "height": HistogramField("height", "sizeY", "number"),
    "gray": HistogramField("gray", "gray", "number"),
    "grayDiff": HistogramField("grayDiff", "grayDiff", "number"),
    "area": HistogramField("area", "area", "number"),
    "mFOVno": HistogramField("mFOVno", "mFOVno", "number"),
    "sFOVno": HistogramField("sFOVno", "sFOVno", "number"),
    "chipX": HistogramField("chipX", "chipX", "number"),
    "chipY": HistogramField("chipY", "chipY", "number"),
    "coordX": HistogramField("coordX", "coordX", "number"),
    "coordY": HistogramField("coordY", "coordY", "number"),
}

ALLOWED_OPERATORS: Final[frozenset[str]] = frozenset(
    {"=", "!=", "<", "<=", ">", ">=", "isEmpty", "isNotEmpty", "isAnyOf"}
)


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
