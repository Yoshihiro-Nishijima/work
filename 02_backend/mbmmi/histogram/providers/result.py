from collections.abc import Sequence

from sqlalchemy import Connection, func, select

from mbmmi.db.query import FilterItem, generate_filter_comps
from mbmmi.result.image import Defect

from ..registry import get_database_column


class ResultDefectHistogramProvider:
    def __init__(self, conn: Connection):
        self._conn = conn

    def fetch(
        self,
        field: str,
        filter_item: FilterItem | None,
    ) -> tuple[int, Sequence[object], Sequence[object]]:
        value_column = get_database_column(field)
        category_column = Defect.__table__.c.defectClass
        filters = [filter_item] if filter_item is not None else []
        conditions = generate_filter_comps(Defect.__table__, filters)
        count_statement = select(func.count()).select_from(Defect.__table__)
        value_statement = select(value_column, category_column).select_from(
            Defect.__table__
        )
        if conditions:
            count_statement = count_statement.where(*conditions)
            value_statement = value_statement.where(*conditions)
        matched_count = self._conn.execute(count_statement).scalar_one()
        rows = self._conn.execute(value_statement).all()
        return (
            matched_count,
            [row[0] for row in rows],
            [row[1] for row in rows],
        )
