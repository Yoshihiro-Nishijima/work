import type { ImageViewProps } from "~/features/misc/types";
import type { JobType } from "~/features/recipe/types";

// UseHtmlBigImage返却値
export interface UseHtmlBigImage {
	imgRef: React.RefObject<HTMLImageElement>;
	canvasRef: React.RefObject<HTMLCanvasElement>;
	GetElmImg: () => HTMLImageElement | null;
	// GetElmCanvas: () => HTMLCanvasElement | null
	GetContext: () => CanvasRenderingContext2D | null;
	GetComplete: () => boolean;
	SetSizeImg: (width: number, height: number, scale?: number) => void;
	SetSizeCanvas: (width: number, height: number) => void;
	SetImageData: (imageData: ImageData, type?: string | undefined) => void;
}

export interface ImageViewInfoParam {
	imageView: ImageViewProps;
	jobType: JobType | undefined;
	itemHidden?: boolean;
}
