import { type Point, Rectangle } from "pixi.js";
import type { DefectPoint } from "../types";

/**
 * 空間分割による効率的な最近座標検索
 */
export class QuadTree {
	private boundary: Rectangle;
	private capacity: number;
	private defects: DefectPoint[] = [];
	private drawedDefects: Set<number>;
	private divided = false;

	private northeast?: QuadTree;
	private northwest?: QuadTree;
	private southeast?: QuadTree;
	private southwest?: QuadTree;

	/**
	 * コンストラクタ
	 * @param boundary このQuadTreeがカバーする矩形領域
	 * @param capacity 分割前に保持できる最大欠陥点数（デフォルト: 10）
	 */
	constructor(
		boundary: Rectangle,
		capacity = 10,
		drawedDefects?: Set<number>,
	) {
		this.boundary = boundary;
		this.capacity = capacity;
		this.drawedDefects = drawedDefects ?? new Set<number>();
	}

	/**
	 * QuadTreeに欠陥点を追加
	 * @param defect 欠陥点
	 * @returns 追加成否 (範囲外の場合は失敗)
	 */
	insert(defect: DefectPoint): boolean {
		if (!this.boundary.contains(defect.x, defect.y)) return false;

		if (this.defects.length < this.capacity) {
			this.defects.push(defect);
			return true;
		}

		if (!this.divided) this.subdivide();

		return (
			(this.northeast?.insert(defect) ?? false) ||
			(this.northwest?.insert(defect) ?? false) ||
			(this.southeast?.insert(defect) ?? false) ||
			(this.southwest?.insert(defect) ?? false)
		);
	}

	/**
	 * このノードを4つの子ノードに分割
	 * 内部的に使用
	 */
	private subdivide() {
		const { x, y, width, height } = this.boundary;
		const hw = width / 2;
		const hh = height / 2;

		this.northeast = new QuadTree(
			new Rectangle(x + hw, y, hw, hh),
			this.capacity,
			this.drawedDefects,
		);
		this.northwest = new QuadTree(
			new Rectangle(x, y, hw, hh),
			this.capacity,
			this.drawedDefects,
		);
		this.southeast = new QuadTree(
			new Rectangle(x + hw, y + hh, hw, hh),
			this.capacity,
			this.drawedDefects,
		);
		this.southwest = new QuadTree(
			new Rectangle(x, y + hh, hw, hh),
			this.capacity,
			this.drawedDefects,
		);

		this.divided = true;
	}

	/**
	 * 指定された矩形範囲内に存在する欠陥点を検索
	 * @param range 検索対象の矩形領域
	 * @param found 再帰的に収集された欠陥点（通常は省略）
	 * @returns 範囲内に存在する欠陥点リスト
	 */
	query(range: Rectangle, found: DefectPoint[] = []): DefectPoint[] {
		if (!this.boundary.intersects(range)) return found;

		for (const p of this.defects) {
			if (range.contains(p.x, p.y)) found.push(p);
		}

		if (this.divided) {
			this.northeast?.query(range, found);
			this.northwest?.query(range, found);
			this.southeast?.query(range, found);
			this.southwest?.query(range, found);
		}

		return found;
	}

	/**
	 * 指定座標に最も近い欠陥点を検索。
	 * @param position 指定座標
	 * @param radius 検索範囲の半径
	 * @returns 最も近い欠陥点、見つからない場合は null
	 */
	getNearestPoint(position: Point, radius = 1): DefectPoint | null {
		const range = new Rectangle(
			position.x - radius,
			position.y - radius,
			radius * 2,
			radius * 2,
		);
		const candidates = this.query(range);

		let nearest: DefectPoint | null = null;
		let minDistSq = Number.POSITIVE_INFINITY;
		for (const p of candidates) {
			const distSq = (p.x - position.x) ** 2 + (p.y - position.y) ** 2;
			if (distSq < minDistSq) {
				minDistSq = distSq;
				nearest = p;
			}
		}
		return nearest;
	}

	/**
	 * QuadTreeをクリア
	 */
	clear(): void {
		this.defects = [];
		this.divided = false;
		this.drawedDefects.clear();
		this.northeast = undefined;
		this.northwest = undefined;
		this.southeast = undefined;
		this.southwest = undefined;
	}

	pushDrawedDefectId(defectId: number): void {
		this.drawedDefects.add(defectId);
	}

	clearDrawedDefectIds(): void {
		this.drawedDefects.clear();
	}

	/**
	 * QuadTreeに登録されているすべての欠陥点を取得
	 * @returns 全ての欠陥点リスト
	 */
	getAllDefects(includeDrawed = true): DefectPoint[] {
		const all: DefectPoint[] = includeDrawed
			? [...this.defects]
			: [...this.defects.filter((d) => !this.drawedDefects.has(d.defectId))];
		if (!this.divided) return all;

		if (this.northeast != null) {
			for (const d of this.northeast.getAllDefects(includeDrawed)) all.push(d);
		}
		if (this.northwest != null) {
			for (const d of this.northwest.getAllDefects(includeDrawed)) all.push(d);
		}
		if (this.southeast != null) {
			for (const d of this.southeast.getAllDefects(includeDrawed)) all.push(d);
		}
		if (this.southwest != null) {
			for (const d of this.southwest.getAllDefects(includeDrawed)) all.push(d);
		}
		return all;
	}

	/**
	 * QuadTreeに欠陥点が登録されているか否か
	 * @returns 欠陥点登録有無
	 */
	isEmpty(): boolean {
		const isEmpty = this.defects.length === 0;
		if (!this.divided) return isEmpty;

		return (
			(this.northeast == null || this.northeast.isEmpty()) &&
			(this.northwest == null || this.northwest.isEmpty()) &&
			(this.southeast == null || this.southeast.isEmpty()) &&
			(this.southwest == null || this.southwest.isEmpty())
		);
	}
}
