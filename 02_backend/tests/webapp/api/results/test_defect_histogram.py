import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, insert
from sqlalchemy.engine import Connection
from sqlalchemy.pool import StaticPool

from mbmmi.result.image import Defect
from webapp.dependencies import get_images_db
from webapp.routers.api.defect_histogram import router


def _defect(defect_id: int, width: int, defect_class: int) -> dict[str, object]:
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


@pytest.fixture
def api_client():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Defect.__table__.create(engine)
    conn: Connection = engine.connect()
    conn.execute(
        insert(Defect.__table__),
        [_defect(1, 1, 0), _defect(2, 3, 2), _defect(3, 5, 11)],
    )
    conn.commit()
    app = FastAPI()
    app.include_router(router, prefix="/results")

    def get_test_connection():
        yield conn

    app.dependency_overrides[get_images_db] = get_test_connection
    with TestClient(app) as client:
        yield client
    conn.close()
    engine.dispose()


def test_histogram_api_applies_only_the_filter_item(api_client: TestClient):
    response = api_client.post(
        "/results/demo/defect-histogram",
        json={
            "field": "width",
            "filter": {"field": "width", "operator": ">", "value": "2"},
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["matchedCount"] == 2
    assert payload["numericValueCount"] == 2
    assert sum(payload["counts"]) == 2
    assert payload["categories"]


def test_histogram_range_api_and_validation(api_client: TestClient):
    response = api_client.post(
        "/results/demo/defect-histogram-range",
        json={"field": "width", "lower": 2, "upper": 3},
    )

    assert response.status_code == 200
    assert response.json()["counts"] == {"left": 1, "selected": 1, "right": 1}

    invalid_field = api_client.post(
        "/results/demo/defect-histogram",
        json={"field": "notAField"},
    )
    invalid_range = api_client.post(
        "/results/demo/defect-histogram-range",
        json={"field": "width", "lower": 4, "upper": 3},
    )
    assert invalid_field.status_code == 422
    assert invalid_range.status_code == 422
    assert "sql" not in invalid_field.text.lower()
