export interface DefectDisplay {
	name: string;
	color: string;
}

export interface DefectDisplayRow extends DefectDisplay {
	filterNo: number;
}
