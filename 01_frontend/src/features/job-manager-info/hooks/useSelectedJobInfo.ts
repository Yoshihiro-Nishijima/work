import { atom, useAtom } from "jotai";
import { atomFamily } from "jotai/utils";
import type { Dispatch, SetStateAction } from "react";

const selectedJobNameAtom = atomFamily((_: string) => atom(""));

interface UseSelectedJobInfo {
	selectedToolDataJobName: string;
	setSelectedToolDataJobName: Dispatch<SetStateAction<string>>;
	selectedResultsJobName: string;
	setSelectedResultsJobName: Dispatch<SetStateAction<string>>;
	selectedDesignJobName: string;
	setSelectedDesignJobName: Dispatch<SetStateAction<string>>;
	selectedNodeJobName: string;
	setSelectedNodeJobName: Dispatch<SetStateAction<string>>;
}

export const useSelectedJobInfo = (): UseSelectedJobInfo => {
	const [selectedToolDataJobName, setSelectedToolDataJobName] = useAtom(
		selectedJobNameAtom("ToolData"),
	);
	const [selectedResultsJobName, setSelectedResultsJobName] = useAtom(
		selectedJobNameAtom("Results"),
	);
	const [selectedDesignJobName, setSelectedDesignJobName] = useAtom(
		selectedJobNameAtom("Design"),
	);
	const [selectedNodeJobName, setSelectedNodeJobName] = useAtom(
		selectedJobNameAtom("Node"),
	);

	return {
		selectedToolDataJobName,
		setSelectedToolDataJobName,
		selectedResultsJobName,
		setSelectedResultsJobName,
		selectedDesignJobName,
		setSelectedDesignJobName,
		selectedNodeJobName,
		setSelectedNodeJobName,
	};
};
