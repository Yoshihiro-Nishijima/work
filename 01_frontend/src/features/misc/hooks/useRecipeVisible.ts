import { atom, useAtom } from "jotai";
import type { Dispatch, SetStateAction } from "react";

const recipeVisibleAtom = atom(false);

interface UseRecipeVisible {
	recipeVisible: boolean;
	setRecipeVisible: Dispatch<SetStateAction<boolean>>;
}

export const useRecipeVisible = (): UseRecipeVisible => {
	const [recipeVisible, setRecipeVisible] = useAtom(recipeVisibleAtom);
	return { recipeVisible, setRecipeVisible };
};
