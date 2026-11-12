import { Stack, Typography } from "@mui/material";
import { ProgressBar } from "components/elements";

import { memo } from "react";
import { useDiskUsage } from "../hooks/useDiskUsage";
import type { DiskUsage } from "../types";

const DiskSection = memo(
	({ label, usage }: { label: string; usage: DiskUsage }) => {
		return (
			<Stack spacing={1} direction="row">
				<Typography>{label}</Typography>
				<ProgressBar value={usage.usePer} />
				<Typography>Avail:{usage.available}</Typography>
			</Stack>
		);
	},
);

export const DiskAvailable = (): JSX.Element => {
	const { usage } = useDiskUsage();
	return usage.toolData ? (
		<Stack spacing={2} direction="row">
			<DiskSection label="ToolData" usage={usage.toolData} />
			<DiskSection label="Result" usage={usage.result} />
		</Stack>
	) : (
		<DiskSection label="Storage" usage={usage.result} />
	);
};
