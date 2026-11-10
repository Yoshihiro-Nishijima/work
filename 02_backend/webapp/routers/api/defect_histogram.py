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


@router.post(
    "/{name}/defect-histogram",
    response_model=DefectHistogramResponse,
)
def get_defect_histogram(
    request: DefectHistogramRequest,
    conn: ImagesDBDep,
) -> DefectHistogramResponse:
    try:
        return _service(conn).calculate(request.field, _filter_item(request.filter))
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc


@router.post(
    "/{name}/defect-histogram-range",
    response_model=DefectHistogramRangeResponse,
)
def get_defect_histogram_range(
    request: DefectHistogramRangeRequest,
    conn: ImagesDBDep,
) -> DefectHistogramRangeResponse:
    try:
        return _service(conn).calculate_range(
            request.field,
            _filter_item(request.filter),
            request.lower,
            request.upper,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc
