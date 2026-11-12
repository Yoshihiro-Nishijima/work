import type { Meta, StoryObj } from "@storybook/react";
import { type ComponentProps, useEffect, useState } from "react";

import type { ErrorMessage } from "~/components/types/ErrorMessageType";
import { useReTestRun } from "~/features/recipe/hooks/mocks/useReTestRun.mock";

import { ReTestRunButton } from "../../re-testrun";

type Props = ComponentProps<typeof ReTestRunButton> & {
	isTestRunning: boolean;
	errorMessage: ErrorMessage | undefined;
};

const ReTestRunButtonMock = (props: Props): JSX.Element => {
	const [isTestRunning, setIsTestRunning] = useState(props.isTestRunning);
	const [propErrorMessage, setPropErrorMessage] = useState<
		ErrorMessage | undefined
	>(undefined);
	const [errorMessage, setErrorMessage] = useState<ErrorMessage | undefined>(
		undefined,
	);
	const [isSuccess, setIsSuccess] = useState(false);

	useReTestRun.mockReturnValue({
		testRunProcessedCount: 0,
		isTestRunning,
		isSuccess,
		errorMessage,
		doReTestRun: (): (() => void) => {
			setIsTestRunning(true);
			setIsSuccess(false);
			setErrorMessage(undefined);
			setTimeout(() => {
				if (propErrorMessage != null) {
					setErrorMessage(propErrorMessage);
				} else {
					setIsSuccess(true);
				}
				setIsTestRunning(false);
			}, 3000);
			return () => {};
		},
	});

	useEffect(() => {
		setIsTestRunning(props.isTestRunning);
	}, [props.isTestRunning]);

	useEffect(() => {
		setPropErrorMessage(props.errorMessage);
	}, [props.errorMessage]);

	return <ReTestRunButton />;
};

const meta = {
	component: ReTestRunButtonMock,
} satisfies Meta<typeof ReTestRunButton>;

export default meta;
type Story = StoryObj<typeof ReTestRunButtonMock>;

export const ReTestRunSuccess: Story = {
	args: {
		isTestRunning: false,
	},
};

export const ReTestRunFail: Story = {
	args: {
		isTestRunning: false,
		errorMessage: [
			{
				msg: "ErrorMessage1",
				loc: [],
				type: "",
			},
			{
				msg: "ErrorMessage2",
				loc: [],
				type: "",
			},
		],
	},
	argTypes: {
		errorMessage: {
			description:
				"ボタン押下後にdetail内のmsgを画面に表示する。<br>msgが複数ある場合は複数行に分けて表示する。<br>detail内のloc、typeは本コンポーネントでは表示しない。",
		},
	},
};
