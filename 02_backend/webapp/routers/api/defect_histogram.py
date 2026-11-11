import logging

from fastapi import APIRouter, HTTPException, status

from mbmmi.db.query import FilterItem
from mbmmi.histogram.models import (
    DefectHistogramRangeRequest,
    DefectHistogramRangeResponse,
    DefectHistogramRequest,
    DefectHistogramResponse,
    HistogramFilterItem,
)
from mbmmi.histogram.providers.result import ResultDefectHistogramProvider
from mbmmi.histogram.service import DefectHistogramService
from webapp.dependencies import ImagesDBDep

router = APIRouter()
logger = logging.getLogger(__name__)


def _service(conn: ImagesDBDep) -> DefectHistogramService:
    return DefectHistogramService(ResultDefectHistogramProvider(conn))


def _filter_item(
    request_filter: HistogramFilterItem | None,
) -> FilterItem | None:
    return (
        FilterItem(
            field=request_filter.field,
            operator=request_filter.operator,
            value=request_filter.value,
        )
        if request_filter is not None
        else None
    )


def _log_histogram_result(
    result_name: str,
    field: str,
    filter_item: FilterItem | None,
    matched_count: int,
    numeric_value_count: int,
) -> None:
    filter_count = int(filter_item is not None)
    if matched_count == 0:
        zero_reason = "filter_no_match" if filter_count else "no_matched_rows"
    elif numeric_value_count == 0:
        zero_reason = "no_finite_numeric_values"
    else:
        zero_reason = "none"
    logger.info(
        "Defect histogram resultName=%s field=%s matchedCount=%d "
        "numericValueCount=%d filterCount=%d zeroReason=%s",
        result_name,
        field,
        matched_count,
        numeric_value_count,
        filter_count,
        zero_reason,
    )


@router.post(
    "/{name}/defect-histogram",
    response_model=DefectHistogramResponse,
)
def get_defect_histogram(
    name: str,
    request: DefectHistogramRequest,
    conn: ImagesDBDep,
) -> DefectHistogramResponse:
    try:
        filter_item = _filter_item(request.filter)
        result = _service(conn).calculate(request.field, filter_item)
        _log_histogram_result(
            name,
            request.field,
            filter_item,
            result.matchedCount,
            result.numericValueCount,
        )
        return result
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc


@router.post(
    "/{name}/defect-histogram-range",
    response_model=DefectHistogramRangeResponse,
)
def get_defect_histogram_range(
    name: str,
    request: DefectHistogramRangeRequest,
    conn: ImagesDBDep,
) -> DefectHistogramRangeResponse:
    try:
        filter_item = _filter_item(request.filter)
        result = _service(conn).calculate_range(
            request.field,
            filter_item,
            request.lower,
            request.upper,
        )
        _log_histogram_result(
            name,
            request.field,
            filter_item,
            result.matchedCount,
            result.numericValueCount,
        )
        return result
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc
