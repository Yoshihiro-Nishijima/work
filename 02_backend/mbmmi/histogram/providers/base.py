from collections.abc import Sequence
from typing import Protocol

from mbmmi.db.query import FilterItem


class DefectHistogramDataProvider(Protocol):
    def fetch(
        self,
        field: str,
        filter_item: FilterItem | None,
    ) -> tuple[int, Sequence[object], Sequence[object]]: ...
