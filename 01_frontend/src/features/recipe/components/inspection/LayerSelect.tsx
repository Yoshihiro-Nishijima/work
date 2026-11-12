import ClearIcon from "@mui/icons-material/Clear";
import {
	Box,
	Button,
	Chip,
	Grid,
	IconButton,
	MenuItem,
	Select,
	type SelectChangeEvent,
} from "@mui/material";
import { useCallback } from "react";
import { LabeledFormGrid } from "~/components/elements";
import { useImportedParam } from "~/features/recipe/hooks/useImportedParam";
import { sortNumeric } from "~/utils/arrayUtils";
import { useInspectionParam, useSetInspectionParam } from "../../hooks";

export const LayerSelect = (): JSX.Element => {
	const { designLayerIDs } = useImportedParam();
	const { layerFilter, layerEnabled } = useInspectionParam();
	const { setLayerFilter } = useSetInspectionParam();
	const sortedDesignLayerIDs = [...designLayerIDs].sort((a, b) => a - b);

	const handleChange = useCallback(
		(e: SelectChangeEvent<string[]>) => {
			const changeLayers =
				typeof e.target.value === "string"
					? e.target.value.split(",")
					: e.target.value;
			const newValue = changeLayers.splice(-1)[0].toString();
			if (changeLayers.includes(newValue)) {
				// 追加された値が既にある場合は、選択中のものを削除したということなので消す
				setLayerFilter(changeLayers.filter((l) => l !== newValue));
			} else {
				setLayerFilter([...changeLayers, newValue]);
			}
		},
		[setLayerFilter],
	);
	const handleDelete = (delLayer: string | number): void => {
		setLayerFilter(layerFilter.filter((l) => l !== delLayer));
	};
	const handleClear = (): void => {
		setLayerFilter([]);
	};
	const handleAddAll = (): void => {
		setLayerFilter(sortedDesignLayerIDs.map((l) => l.toString()));
	};

	return (
		<LabeledFormGrid label="ID" labelXs={3}>
			<Grid container alignItems="flex-end">
				<Grid item xs={8.5}>
					<Select
						multiple
						value={layerFilter}
						onChange={handleChange}
						disabled={!layerEnabled}
						sx={{
							textAlign: "left",
							width: "100%",
							minHeight: "32px",
							height: "auto",
						}}
						renderValue={(selected) => {
							return (
								<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
									{sortNumeric(selected).map((value) => (
										<Chip
											key={value}
											label={value}
											disabled={!layerEnabled}
											sx={{ height: "26px" }}
											onDelete={() => {
												handleDelete(value);
											}}
											onMouseDown={(e) => {
												e.stopPropagation();
											}}
										/>
									))}
								</Box>
							);
						}}
						// SELECTメニューのポップオーバー位置を左上起点に設定
						MenuProps={{
							anchorOrigin: { vertical: "top", horizontal: "left" },
							transformOrigin: { vertical: "bottom", horizontal: "left" },
						}}
					>
						{sortedDesignLayerIDs.map((layerId) => (
							<MenuItem key={layerId} value={layerId}>
								{layerId}
							</MenuItem>
						))}
					</Select>
				</Grid>
				<Grid item xs="auto">
					<IconButton
						disabled={!layerEnabled}
						sx={{
							color: "primary.main",
							paddingBottom: 0,
							visibility: layerFilter.length > 0 ? undefined : "hidden",
						}}
						onClick={handleClear}
					>
						<ClearIcon />
					</IconButton>
				</Grid>
				<Grid item xs="auto">
					<Button
						disabled={!layerEnabled}
						sx={{
							minWidth: "36px",
							height: "100%",
							paddingBottom: 0,
						}}
						onClick={handleAddAll}
					>
						All
					</Button>
				</Grid>
			</Grid>
		</LabeledFormGrid>
	);
};
