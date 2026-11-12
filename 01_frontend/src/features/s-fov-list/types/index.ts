export interface ResultsRecord {
	toolData: string;
	class: string;
	defectCount: number;
	defectDensity: number;
}

export interface Fov {
	imageid: number;
	mfovno: number;
	sfovno: number;
	areano: number;
	seqno: number;
	indexX: number;
	indexY: number;
	coordX: number;
	coordY: number;
	defectNum: number | undefined;
}
