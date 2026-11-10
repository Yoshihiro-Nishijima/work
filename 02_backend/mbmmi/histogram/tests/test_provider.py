from sqlalchemy import create_engine, insert

from mbmmi.db.query import FilterItem
from mbmmi.histogram.providers.result import ResultDefectHistogramProvider
from mbmmi.result.image import Defect


def _defect(defect_id: int, width: int, defect_class: int = 1) -> dict[str, object]:
    return {
        "defectId": defect_id,
        "chipX": 0,
        "chipY": 0,
        "coordX": float(defect_id),
        "coordY": float(defect_id),
        "abnormality": float(defect_id),
        "defectClass": defect_class,
        "mFOVno": 1,
        "sFOVno": 1,
        "defectNo": defect_id,
        "sizeX": width,
        "sizeY": width,
        "area": width,
        "caughtBy": 0,
        "topLeftX": 0,
        "topLeftY": 0,
        "bottomRightX": 1,
        "bottomRightY": 1,
        "gray": width,
        "grayDiff": width,
        "layers": [],
    }


def test_provider_filters_full_result_rows_and_returns_class_values():
    engine = create_engine("sqlite://")
    Defect.__table__.create(engine)
    with engine.connect() as conn:
        conn.execute(
            insert(Defect.__table__),
            [_defect(1, 1), _defect(2, 4, 2), _defect(3, 5, 11)],
        )
        conn.commit()
        result = ResultDefectHistogramProvider(conn).fetch(
            "width",
            FilterItem(field="sizeX", operator=">=", value=4),
        )

    assert result == (2, [4, 5], [2, 11])
