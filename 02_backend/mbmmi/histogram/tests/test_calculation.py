import math

from mbmmi.histogram.calculation import HistogramCalculationService, normalize_category


def test_empty_values_return_normal_empty_response():
    result = HistogramCalculationService.calculate([], [], 0)

    assert result.data_min is None
    assert result.edges == []
    assert result.counts == []
    assert result.numeric_value_count == 0


def test_non_finite_values_are_excluded_and_unknown_categories_are_normalized():
    result = HistogramCalculationService.calculate(
        [1.0, None, math.nan, math.inf, 2.0],
        [0, None, 999, 1, "invalid"],
        5,
    )

    assert result.numeric_value_count == 2
    assert normalize_category(None) == -1
    assert normalize_category(999) == -1
    assert [category for category, _ in result.categories] == [-1, 0]


def test_last_bin_contains_maximum_value():
    result = HistogramCalculationService.calculate([0, 1, 2], [0, 0, 0], 3)

    assert len(result.edges) == len(result.counts) + 1
    assert sum(result.counts) == 3


def test_range_boundaries_are_inclusive_for_selected_range():
    result = HistogramCalculationService.calculate_range(
        [0, 1, 2, 3],
        [0, 0, 0, 0],
        1,
        2,
        4,
    )

    assert result.counts == (1, 2, 1)
