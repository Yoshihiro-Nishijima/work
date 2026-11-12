import { atom, useAtom, useAtomValue } from "jotai";
import { useAtomCallback } from "jotai/utils";
import {
	type Dispatch,
	type SetStateAction,
	useCallback,
	useEffect,
	useRef,
} from "react";
import type { Filter } from "~/features/job-manager-info/types";
import { useIdw } from "~/features/map/hooks/useIdw";
import { useMfovnoForSEMImage } from "~/features/map/hooks/useMfovnoForSEMImage";
import { useSfovnoForSEMImage } from "~/features/map/hooks/useSfovnoForSEMImage";
import { resultNameAtom } from "~/features/misc/hooks/useResultName";
import type { Position, Size } from "~/features/misc/types";
import { toPagingQueryParam } from "~/features/misc/types/pagingQueryParam";
import {
	useSEMImageValue,
	useSetSEMImage,
} from "~/features/s-fov-image/hooks/useSEMImage";
import { getFov } from "~/features/s-fov-list/api/getFov";

const chipXAtom = atom(0);
const chipYAtom = atom(0);
const sFovXAtom = atom(0);
const sFovYAtom = atom(0);
const notFoundSFovAtom = atom(false);
const isSpecifiedCoordInSFovAtom = atom(false);

/** 指定座標管理 */
export interface UseSFov {
	/** Chip座標x */
	chipX: number;
	/** Chip座標y */
	chipY: number;
	/** SFov座標x */
	sFovX: number;
	/** SFov座標y */
	sFovY: number;
	setChipX: Dispatch<SetStateAction<number>>;
	setChipY: Dispatch<SetStateAction<number>>;
	setSFovX: Dispatch<SetStateAction<number>>;
	setSFovY: Dispatch<SetStateAction<number>>;
	/** sFovビューア用のFovNoのセット */
	setMfovnoAndSfovno: () => Promise<boolean>;
	notFoundSFov: boolean;
	/** 指定座標がsFov内に含まれているか否かをセット */
	setIsSpecifiedCoordInSelectedSFov: (
		indexX: number,
		indexY: number,
		coordX: number,
		coordY: number,
	) => void;
	/** 指定座標がsFov内に含まれているか否か */
	isSpecifiedCoordInSFov: boolean;
	/** ユーザ指定Chip内座標(idw)の Canvas座標取得関数 */
	getSpecifiedCoordForCanvas: (semSize: Size) => { left: number; top: number };
}

/** 指定座標管理 */
export const useSFov = (): UseSFov => {
	const { setMfovnoForSEMImage } = useMfovnoForSEMImage();
	const { setSfovnoForSEMImage } = useSfovnoForSEMImage();
	const { getSFovSize } = useIdw();

	const [chipX, setChipX] = useAtom(chipXAtom);
	const [chipY, setChipY] = useAtom(chipYAtom);
	const [sFovX, setSFovX] = useAtom(sFovXAtom);
	const [sFovY, setSFovY] = useAtom(sFovYAtom);
	const [notFoundSFov, setNotFoundSFov] = useAtom(notFoundSFovAtom);
	const isSpecifiedCoordInSFov = useAtomValue(isSpecifiedCoordInSFovAtom);

	const { coordX, coordY } = useSEMImageValue();
	const { setCoord } = useSetSEMImage();

	// 指定座標変更時に notFoundSFovフラグを解除
	const prevChipXYSFovXYRef = useRef({ chipX, chipY, sFovX, sFovY });
	if (
		prevChipXYSFovXYRef.current.chipX !== chipX ||
		prevChipXYSFovXYRef.current.chipY !== chipY ||
		prevChipXYSFovXYRef.current.sFovX !== sFovX ||
		prevChipXYSFovXYRef.current.sFovY !== sFovY
	) {
		if (notFoundSFov) {
			setNotFoundSFov(false);
		}
		prevChipXYSFovXYRef.current = { chipX, chipY, sFovX, sFovY };
	}

	const abortControllerRef = useRef<AbortController | null>(null);
	// biome-ignore lint/correctness/useExhaustiveDependencies: 本来useRefはdeps指定の対象外だが、アンマウント処理で使用するref.currentの更新が必要なので指定する
	useEffect(() => {
		return () => {
			// アンマウント時にAPIリクエストが残っていたらキャンセル
			if (abortControllerRef.current != null) {
				abortControllerRef.current.abort();
			}
		};
	}, [abortControllerRef.current]);

	// 指定座標からsFovを取得するためのクエリ文字列を生成
	const generateQuery = useCallback(
		(
			chipX: number,
			chipY: number,
			sFovX: number,
			sFovY: number,
			sFovSizeX: number,
			sFovSizeY: number,
		): string => {
			const sFovHalfWidth = sFovSizeX / 2;
			const sFovHalfHeight = sFovSizeY / 2;
			const filter: Filter | undefined = {
				items: [
					{ field: "indexX", operator: "=", value: chipX },
					{ field: "indexY", operator: "=", value: chipY },
					{ field: "coordX", operator: ">=", value: sFovX - sFovHalfWidth },
					{ field: "coordX", operator: "<=", value: sFovX + sFovHalfWidth },
					{
						field: "coordY",
						operator: ">=",
						value: sFovY - sFovHalfHeight,
					},
					{
						field: "coordY",
						operator: "<=",
						value: sFovY + sFovHalfHeight,
					},
				],
				logicOperator: "and",
			};
			return toPagingQueryParam(
				{ pageSize: 1, page: 0 },
				[{ field: "imageid", direction: "asc" }],
				filter,
			);
		},
		[],
	);

	// sFovビューア用のFovNoのセット
	const setMfovnoAndSfovno = useAtomCallback(
		useCallback(
			async (get, set): Promise<boolean> => {
				return await new Promise<boolean>((resolve, reject) => {
					const resultName = get(resultNameAtom);
					const chipX = get(chipXAtom);
					const chipY = get(chipYAtom);
					const sFovX = get(sFovXAtom);
					const sFovY = get(sFovYAtom);
					// getFovにて取得したcoordX、coordY、idw.fovPitch.x, idw.fovPitch.yを用いて
					// 指定座標(chip座標(x,y)、sFov座標(x,y)範囲内のsFovを取得する
					const sfovSize = getSFovSize(chipX, chipY);
					if (sfovSize == null) {
						set(notFoundSFovAtom, true);
						resolve(false);
						return;
					}
					const query = generateQuery(
						chipX,
						chipY,
						sFovX,
						sFovY,
						sfovSize.x,
						sfovSize.y,
					);
					abortControllerRef.current = new AbortController();
					getFov(resultName, query, abortControllerRef.current.signal)
						.then((res) => {
							if (res.fovs.length === 0) {
								if (!get(notFoundSFovAtom)) set(notFoundSFovAtom, true);
								resolve(false);
								return;
							}

							// 取得出来たらsetMfovnoForSEMImage、setSfovnoForSEMImageに設定する
							setMfovnoForSEMImage(res.fovs[0].mfovno);
							setSfovnoForSEMImage(res.fovs[0].sfovno);
							setCoord(res.fovs[0].coordX, res.fovs[0].coordY);
							if (get(notFoundSFovAtom)) set(notFoundSFovAtom, false);
							// Crossボタンを活性に変更
							set(isSpecifiedCoordInSFovAtom, true);
							resolve(true);
						})
						.catch((error) => {
							if (error.name === "AbortError") return;
							reject("getFov fetch fail.");
							return;
						});
				});
			},
			[
				setMfovnoForSEMImage,
				setSfovnoForSEMImage,
				getSFovSize,
				generateQuery,
				setCoord,
			],
		),
	);

	// 選択中sFovの範囲内に指定座標が含まれているか
	const setIsSpecifiedCoordInSelectedSFov = useAtomCallback(
		useCallback(
			(
				get,
				set,
				indexX: number,
				indexY: number,
				coordX: number,
				coordY: number,
			) => {
				const chipX = get(chipXAtom);
				const chipY = get(chipYAtom);
				const sFovX = get(sFovXAtom);
				const sFovY = get(sFovYAtom);
				const sfovSize = getSFovSize(chipX, chipY);
				if (sfovSize == null) {
					set(isSpecifiedCoordInSFovAtom, false);
					return;
				}

				const sFovHalfWidth = sfovSize.x / 2;
				const sFovHalfHeight = sfovSize.y / 2;
				// 選択中sFovの範囲内に指定座標が含まれているか
				if (
					indexX === chipX &&
					indexY === chipY &&
					coordX >= sFovX - sFovHalfWidth &&
					coordX <= sFovX + sFovHalfWidth &&
					coordY >= sFovY - sFovHalfHeight &&
					coordY <= sFovY + sFovHalfHeight
				) {
					set(isSpecifiedCoordInSFovAtom, true);
					setCoord(coordX, coordY);
				} else {
					set(isSpecifiedCoordInSFovAtom, false);
				}
			},
			[getSFovSize, setCoord],
		),
	);

	// 十字マーク表示位置計算処理関数
	const getSpecifiedCoordForCanvas: (semSize: Size) => Position =
		useAtomCallback(
			useCallback(
				(get, _, semSize: Size) => {
					if (coordX == null || coordY == null) return { left: 0, top: 0 };
					const chipX = get(chipXAtom);
					const chipY = get(chipYAtom);
					const sFovX = get(sFovXAtom);
					const sFovY = get(sFovYAtom);

					const sfovSize = getSFovSize(chipX, chipY);
					if (sfovSize == null) return { left: 0, top: 0 };

					// SEMイメージ表示時はY軸を反転させる必要があるため中央座標、ユーザ指定座標のY座標を反転(idw座標)
					const invertedCoordY = sfovSize.y - coordY;
					const invertedSFovY = sfovSize.y - sFovY;
					// SEMイメージ左端のx座標(idw座標)
					const semImageLeft = coordX - sfovSize.x / 2;
					// SEMイメージ上端のy座標(idw座標)
					const semImageTop = invertedCoordY - sfovSize.y / 2;

					// TODO 位置計算を、引数のsem画像サイズから求めるやり方
					// Addアイコン表示の左端のx座標,上端のy座標を計算(canvas座標)
					const left = ((sFovX - semImageLeft) / sfovSize.x) * semSize.width;
					const top =
						((invertedSFovY - semImageTop) / sfovSize.y) * semSize.height;

					// TODO 位置計算を、idw.sFovSizeから求めるやり方
					// // 指定Chip内座標を sFov内座標に計算
					// const left = sFovX - semImageLeft;
					// const top = invertedSFovY - semImageTop;
					return { left, top };
				},
				[getSFovSize, coordX, coordY],
			),
		);

	return {
		chipX,
		chipY,
		sFovX,
		sFovY,
		setChipX,
		setChipY,
		setSFovX,
		setSFovY,
		setMfovnoAndSfovno,
		notFoundSFov,
		setIsSpecifiedCoordInSelectedSFov,
		isSpecifiedCoordInSFov,
		getSpecifiedCoordForCanvas,
	};
};
