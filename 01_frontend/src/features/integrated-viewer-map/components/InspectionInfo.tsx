import { Box, Typography } from "@mui/material";
import { useState } from "react";

import { Tabs } from "~/components/layouts/Tabs";
import { useInspectionInfo } from "~/features/integrated-viewer-map/hooks/useInspectionInfo";

type InspectionInfoKey = keyof ReturnType<typeof useInspectionInfo>["values"];

interface InfoItem {
	label: string;
	key: InspectionInfoKey;
}

const tabs: { label: string; items: InfoItem[] }[] = [
	{
		label: "Recipe情報",
		items: [
			{ label: "Recipe名", key: "recipeName" },
			{ label: "LotID", key: "lotId" },
			{ label: "WaferID", key: "waferId" },
			{ label: "CarrierID", key: "carrierId" },
			{ label: "棚番", key: "slotNo" },
		],
	},
	{
		label: "検査条件",
		items: [
			{ label: "光学条件", key: "scanMode" },
			{ label: "Pixel Size [nm/pixel]", key: "pixelSize" },
			{ label: "Clock", key: "clock" },
			{ label: "加算数（Frame）", key: "frame" },
			{ label: "検査Die数", key: "inspectionDieCount" },
			{ label: "検査方式", key: "jobType" },
		],
	},
	{
		label: "検査結果",
		items: [
			{ label: "検査時間", key: "processTime" },
			{ label: "欠陥数", key: "defectCount" },
			{ label: "欠陥Die数", key: "defectDieCount" },
			{ label: "欠陥密度 [/mm²]", key: "defectDensity" },
			{ label: "検査面積 [µm²]", key: "inspectionArea" },
			{ label: "スループット", key: "throughput" },
		],
	},
];

export const InspectionInfo = (): JSX.Element => {
	const { values } = useInspectionInfo();
	const [tabIndex, setTabIndex] = useState(0);
	const panels = tabs.map((tab) => (
		<Box
			key={tab.label}
			data-testid="inspection-info-list"
			sx={{
				display: "grid",
				gridTemplateColumns: "180px minmax(0, 1fr)",
				gridAutoRows: "20px",
				columnGap: 1.5,
				rowGap: 0,
				alignContent: "start",
				alignItems: "center",
				width: "100%",
				height: "100%",
				minWidth: 0,
				margin: 0,
				padding: 0,
			}}
		>
			{tab.items.flatMap(({ label, key }) => [
				<Box
					key={`label-${key}`}
					data-testid={`inspection-info-label-${key}`}
					sx={{
						display: "flex",
						alignItems: "center",
						height: 20,
						minWidth: 0,
						whiteSpace: "nowrap",
						overflow: "visible",
					}}
				>
					<Typography variant="caption" component="span">
						{label}
					</Typography>
				</Box>,
				<Box
					key={`value-${key}`}
					data-testid={`inspection-info-value-${key}`}
					title={values[key]}
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "flex-end",
						height: 20,
						width: "100%",
						minWidth: 0,
						overflow: "hidden",
						textAlign: "right",
						whiteSpace: "nowrap",
					}}
				>
					<Typography
						variant="caption"
						component="span"
						sx={{
							minWidth: 0,
							width: "100%",
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
							textAlign: "right",
						}}
					>
						{values[key]}
					</Typography>
				</Box>,
			])}
		</Box>
	));

	return (
		<Box
			data-testid="inspection-info-panel"
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "stretch",
				justifyContent: "flex-start",
				width: 420,
				maxWidth: "100%",
				height: "100%",
				alignSelf: "flex-end",
				margin: 0,
				padding: 0,
				paddingTop: 0,
				boxSizing: "border-box",
				minWidth: 0,
				minHeight: 0,
			}}
		>
			<Box
				data-testid="inspection-info-tabs"
				sx={{
					width: "100%",
					height: "100%",
					flexShrink: 0,
					margin: 0,
					padding: 0,
					minWidth: 0,
				}}
			>
				<Tabs
					labels={tabs.map(({ label }) => label)}
					panels={panels}
					currentIdx={tabIndex}
					setCurrentIdx={setTabIndex}
					isCentered={false}
					tabStyle={{ minHeight: 48, height: 48 }}
					style={{ height: "calc(100% - 48px)", overflow: "hidden" }}
				/>
			</Box>
		</Box>
	);
};