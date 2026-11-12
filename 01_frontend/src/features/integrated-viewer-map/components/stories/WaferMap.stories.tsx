import { AppProvider, Stage } from "@pixi/react";
import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "jotai";
import * as PIXI from "pixi.js";
import { useEffect } from "react";

import { useResultName } from "~/features/misc/hooks/useResultName";

import { useMapInfo } from "../../hooks/useMapInfo";
import { WaferMap } from "../WaferMap";

const MockWaferMap = (): JSX.Element => {
	const { setResultName } = useResultName();
	const { setScale } = useMapInfo();
	useEffect(() => {
		setResultName("resultName");
		setScale(1);
	}, [setResultName, setScale]);

	return <WaferMap />;
};

const meta = {
	component: MockWaferMap,
} satisfies Meta<typeof MockWaferMap>;
export default meta;
type Story = StoryObj<typeof MockWaferMap>;

export const Default: Story = {
	args: {},
	decorators: [
		(Story) => {
			const pixiApp = new PIXI.Application({});
			return (
				<Provider>
					<AppProvider value={pixiApp}>
						<Stage
							width={900}
							height={900}
							options={{ backgroundColor: 0x808080 }}
						>
							<Story />
						</Stage>
					</AppProvider>
				</Provider>
			);
		},
	],
};
