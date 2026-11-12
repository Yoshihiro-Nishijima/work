import type { SxProps, Theme } from "@mui/material";

import { Select } from "~/components/elements";
import { LabeledFormGrid } from "~/components/elements/LabeledFormGrid";

export interface SelectProp {
	label: string;
	item: string;
	setItem: (item: string) => void;
	selectOptions: string[];
	selectOptionsText?: string[];
	disabled?: boolean;
	labelXs?: number;
	selectSx?: SxProps<Theme>;
	menuItemSx?: SxProps<Theme>;
	fullWidth?: boolean;
}

export const LabeledSelect = ({
	label,
	item,
	setItem,
	selectOptions,
	selectOptionsText = [],
	disabled = false,
	labelXs = 5,
	selectSx = { width: "100%" },
	menuItemSx,
	fullWidth = false,
}: SelectProp): JSX.Element => {
	return (
		<LabeledFormGrid label={label} labelXs={labelXs} disabled={disabled}>
			<Select
				item={item}
				setItem={setItem}
				selectOptions={selectOptions}
				selectOptionsText={selectOptionsText}
				sx={selectSx}
				menuItemSx={menuItemSx}
				disabled={disabled}
				fullWidth={fullWidth}
			/>
		</LabeledFormGrid>
	);
};
