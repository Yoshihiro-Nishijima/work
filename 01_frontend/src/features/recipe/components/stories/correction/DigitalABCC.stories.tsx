import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "jotai";
import { useEffect } from "react";

import { useSetCorrectionParam } from "~/features/recipe/hooks";
import type { CorrectionParam } from "~/features/recipe/types";
import { DigitalABCC } from "../../correction";

const meta: Meta<typeof DigitalABCC> = {
	component: DigitalABCC,
};

export default meta;

const Init = (): undefined => {
	const { setCorrectionParam } = useSetCorrectionParam();

	// biome-ignore  lint/correctness/useExhaustiveDependencies: 1度だけ初期化する
	useEffect(
		() => setCorrectionParam({ digitalABCC: {} } as CorrectionParam),
		[],
	);
};

type Story = StoryObj<typeof DigitalABCC>;

export const Default: Story = {
	render: () => (
		<Provider>
			<Init />
			<DigitalABCC />
		</Provider>
	),
};
