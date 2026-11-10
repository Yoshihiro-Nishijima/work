import math

from pydantic import BaseModel, ConfigDict, Field, model_validator


class HistogramFilterItem(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)

    field: str = Field(min_length=1)
    operator: str = Field(min_length=1)
    value: object | None = None


class DefectHistogramRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)

    field: str = Field(min_length=1)
    filter: HistogramFilterItem | None = None


class DefectHistogramRangeRequest(DefectHistogramRequest):
    lower: float
    upper: float

    @model_validator(mode="after")
    def validate_range(self):
        if not math.isfinite(self.lower) or not math.isfinite(self.upper):
            raise ValueError("lower and upper must be finite numbers")
        if self.lower > self.upper:
            raise ValueError("lower must be less than or equal to upper")
        return self


class HistogramCategory(BaseModel):
    categoryNo: int
    counts: list[int]


class DefectHistogramResponse(BaseModel):
    dataMin: float | None
    dataMax: float | None
    edges: list[float]
    counts: list[int]
    categories: list[HistogramCategory]
    matchedCount: int
    numericValueCount: int


class HistogramRangeCounts(BaseModel):
    left: int
    selected: int
    right: int


class HistogramRangeCategory(BaseModel):
    categoryNo: int
    counts: HistogramRangeCounts


class DefectHistogramRangeResponse(BaseModel):
    counts: HistogramRangeCounts
    categories: list[HistogramRangeCategory]
    matchedCount: int
    numericValueCount: int
