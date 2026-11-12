import { AppProvider, Stage } from "@pixi/react";
import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "jotai";
import { Point } from "pixi.js";
import * as PIXI from "pixi.js";
import { type ComponentProps, useEffect } from "react";

import { useMapInfo } from "../../hooks/useMapInfo";
import { usePinInfo } from "../../hooks/usePinInfo";
import { Pin } from "../Pin";

// カスタムフックに値をセットするモックコンポーネント
type Props = ComponentProps<typeof Pin> & {
	pinPointX: number;
	pinPointY: number;
	pinSize: number;
};
const MockPin = (props: Props): JSX.Element => {
	const { setPinPoint } = usePinInfo();
	const { setScale } = useMapInfo();
	useEffect(() => {
		const pinScale = 10 - props.pinSize + 1;
		setScale(pinScale);
		setPinPoint(new Point(props.pinPointX, props.pinPointY));
	}, [setScale, setPinPoint, props.pinPointX, props.pinPointY, props.pinSize]);
	return <Pin />;
};

const meta = {
	component: MockPin,
} satisfies Meta<typeof MockPin>;
export default meta;
type Story = StoryObj<typeof MockPin>;

export const Default: Story = {
	args: {
		pinPointX: 50,
		pinPointY: 50,
		pinSize: 10,
	},
	argTypes: {
		pinPointX: {
			control: { type: "number", min: 1, max: 500, step: 2 },
			description: "PinIcon PointX. 1 < 500",
			table: {
				defaultValue: { summary: "50" },
			},
		},
		pinPointY: {
			control: { type: "number", min: 1, max: 500, step: 2 },
			description: "PinIcon PointY. 1 < 500",
			table: {
				defaultValue: { summary: "50" },
			},
		},
		pinSize: {
			control: { type: "number", min: 1, max: 10, step: 1 },
			description: "PinIcon Size. 1 < 10",
			table: {
				defaultValue: { summary: "10" },
			},
		},
	},
	decorators: [
		(Story) => {
			const pixiApp = new PIXI.Application({});
			return (
				<Provider>
					<AppProvider value={pixiApp}>
						<Stage
							width={500}
							height={500}
							options={{ backgroundColor: 0xffffff }}
						>
							<Story />
						</Stage>
					</AppProvider>
				</Provider>
			);
		},
	],
};
