import math

import pytest

from mbmmi.db.query import FilterItem
from mbmmi.histogram.service import validate_filter


def test_filter_normalizes_frontend_field_and_numeric_string():
    result = validate_filter(
        "width",
        FilterItem(field="width", operator=">=", value="3.5"),
    )

    assert result is not None
    assert result.field == "sizeX"
    assert result.value == 3.5


def test_filter_rejects_unknown_field_operator_and_non_finite_value():
    with pytest.raises(ValueError, match="unsupported histogram field"):
        validate_filter("unknown", None)
    with pytest.raises(ValueError, match="unsupported filter operator"):
        validate_filter(
            "width",
            FilterItem(field="width", operator="contains", value="1"),
        )
    with pytest.raises(ValueError, match="finite"):
        validate_filter(
            "width",
            FilterItem(field="width", operator=">", value=math.inf),
        )


def test_any_of_requires_a_numeric_list():
    with pytest.raises(ValueError, match="type does not match"):
        validate_filter(
            "width",
            FilterItem(field="width", operator="isAnyOf", value=1),
        )
    result = validate_filter(
        "width",
        FilterItem(field="width", operator="isAnyOf", value=["1", 2]),
    )
    assert result is not None
    assert result.value == [1.0, 2.0]
