import { DOMAIN_API, VIEW_SFOV_PATH } from "~/config";
import { isPositiveInteger } from "~/utils/numUtils";
import { getPathParams } from "~/utils/urlUtils";

function getsFOVImageUrl(): string {
	// URLパス /SFovView/{sFovImageURL} から sFovImageURL を取得
	const urlpath = getPathParams(VIEW_SFOV_PATH);
	if (
		urlpath.length < 4 ||
		urlpath[1] === "" ||
		!isPositiveInteger(Number(urlpath[2])) ||
		!isPositiveInteger(Number(urlpath[3]))
	) {
		return "";
	}
	return `${DOMAIN_API}/tool-data/${urlpath[1]}/${urlpath[2]}-${urlpath[3]}-sem.bmp`;
}
export const SFovView = (): JSX.Element => {
	return (
		<div style={{ height: "100vh", width: "100%", textAlign: "center" }}>
			<img
				src={getsFOVImageUrl()}
				style={{
					height: "100%",
					verticalAlign: "top",
				}}
			/>
		</div>
	);
};
export default SFovView;
