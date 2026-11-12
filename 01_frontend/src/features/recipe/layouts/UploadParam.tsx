import { Checkbox, FormControlLabel, Switch } from "@mui/material";
import { Box, Stack } from "@mui/system";
import {
	type ChangeEvent,
	type Dispatch,
	type SetStateAction,
	useRef,
} from "react";

import { Fieldset } from "~/components/layouts";

import { ListBox } from "~/components/elements/ListBox";
import { CheckboxFieldSet } from "~/features/training-param-setting/components/CheckboxFieldSet";
import { useRecipeCommonParams, useUploadServers } from "../hooks";

import type { IsReadonlyProp, UploadParam } from "../types";

interface UploadDestinationProps {
	idx: number;
	value: UploadParam;
	setter: Dispatch<SetStateAction<UploadParam>>;
}

export const SERVER_LIST_REFRESH_INTERVAL_MS = 10000;

interface SwitchOutputDesignBasedDefectCoordsProps {
	isReadonly?: boolean;
	value: boolean;
	setter: (x: boolean) => void;
}

const UploadDestination = (props: UploadDestinationProps): JSX.Element => {
	const { idx, value, setter } = props;
	const enabled = value?.enabled ?? false;
	const server = value?.server ?? "";
	const images = value?.defectImages ?? false;
	const umMarker = value?.umMarker ?? false;
	const { uploadServers, fetchUploadServers } = useUploadServers();
	const lastFetchedRef = useRef<number | null>(null);

	const fetchIfStale = () => {
		const now = Date.now();
		if (
			!lastFetchedRef.current ||
			now - lastFetchedRef.current > SERVER_LIST_REFRESH_INTERVAL_MS
		) {
			lastFetchedRef.current = now;
			void fetchUploadServers();
		}
	};

	const onEnabledChanged = (checked: boolean): void => {
		setter({ ...value, enabled: checked });
	};

	const setServer = (text: string): void => {
		setter({ ...value, server: text });
	};

	const onImagesChanged = (
		_ev: ChangeEvent<HTMLInputElement>,
		checked: boolean,
	): void => {
		setter({ ...value, defectImages: checked });
	};

	const onMarkerChanged = (
		_ev: ChangeEvent<HTMLInputElement>,
		checked: boolean,
	): void => {
		setter({ ...value, umMarker: checked });
	};

	return (
		<CheckboxFieldSet
			checked={enabled}
			setChecked={onEnabledChanged}
			label={`Upload ${idx}`}
		>
			<Stack direction="column">
				<ListBox
					label="Server"
					text={server}
					setText={setServer}
					selectOptions={uploadServers}
					isReadonly={!enabled}
					onOpen={fetchIfStale}
				/>
				<FormControlLabel
					control={<Checkbox checked={images} onChange={onImagesChanged} />}
					label="Defect images"
					disabled={!enabled}
				/>
				<FormControlLabel
					control={<Checkbox checked={umMarker} onChange={onMarkerChanged} />}
					label="µm marker"
					disabled={!enabled}
				/>
			</Stack>
		</CheckboxFieldSet>
	);
};

const SwitchOutputDesignBasedDefectCoords = (
	props: SwitchOutputDesignBasedDefectCoordsProps,
): JSX.Element => {
	const { isReadonly, value, setter } = props;

	const onOutputDesignBasedDefectCoords = (
		_ev: ChangeEvent<HTMLInputElement>,
		checked: boolean,
	): void => {
		setter(checked);
	};

	return (
		<Box>
			<FormControlLabel
				control={
					<Switch checked={value} onChange={onOutputDesignBasedDefectCoords} />
				}
				label="Output design-based defect coordinates"
				disabled={isReadonly}
			/>
		</Box>
	);
};
export const UploadParams = ({
	isReadonly = false,
}: IsReadonlyProp): JSX.Element => {
	const {
		uploadParam0,
		setUploadParam0,
		uploadParam1,
		setUploadParam1,
		outputDesignBasedDefectCoords,
		setOutputDesignBasedDefectCoords,
	} = useRecipeCommonParams();

	return (
		<Fieldset legend="Upload">
			<Stack direction="row">
				<SwitchOutputDesignBasedDefectCoords
					isReadonly={isReadonly}
					value={outputDesignBasedDefectCoords}
					setter={setOutputDesignBasedDefectCoords}
				/>
			</Stack>
			<Stack direction="row">
				<UploadDestination
					idx={1}
					value={uploadParam0}
					setter={setUploadParam0}
				/>
				<UploadDestination
					idx={2}
					value={uploadParam1}
					setter={setUploadParam1}
				/>
			</Stack>
		</Fieldset>
	);
};
