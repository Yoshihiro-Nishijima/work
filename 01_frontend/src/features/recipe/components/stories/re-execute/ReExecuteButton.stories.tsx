import type { Meta, StoryObj } from "@storybook/react";
import { type ComponentProps, useEffect, useState } from "react";

import type { ErrorMessage } from "~/components/types/ErrorMessageType";
import { useReExecute } from "~/features/recipe/hooks/mocks/useReExecute.mock";

import { ReExecuteButton } from "../../re-execute";

type Props = ComponentProps<typeof ReExecuteButton> & {
	isExecuting: boolean;
	errorMessage: ErrorMessage | undefined;
};

const ReExecuteButtonMock = (props: Props): JSX.Element => {
	const [isExecuting, setIsExecuting] = useState(props.isExecuting);
	const [propErrorMessage, setPropErrorMessage] = useState<
		ErrorMessage | undefined
	>(undefined);
	const [errorMessage, setErrorMessage] = useState<ErrorMessage | undefined>(
		undefined,
	);
	const [isSuccess, setIsSuccess] = useState(false);

	useReExecute.mockReturnValue({
		isExecuting,
		isSuccess,
		errorMessage,
		doReExecute: (): (() => void) => {
			setIsExecuting(true);
			setIsSuccess(false);
			setErrorMessage(undefined);
			setTimeout(() => {
				if (propErrorMessage != null) {
					setErrorMessage(propErrorMessage);
				} else {
					setIsSuccess(true);
				}
				setIsExecuting(false);
			}, 3000);
			return () => {};
		},
	});

	useEffect(() => {
		setIsExecuting(props.isExecuting);
	}, [props.isExecuting]);

	useEffect(() => {
		setPropErrorMessage(props.errorMessage);
	}, [props.errorMessage]);

	return <ReExecuteButton />;
};

const meta = {
	component: ReExecuteButtonMock,
} satisfies Meta<typeof ReExecuteButton>;

export default meta;
type Story = StoryObj<typeof ReExecuteButtonMock>;

export const ReExecuteSuccess: Story = {
	args: {
		isExecuting: false,
	},
};

export const ReExecuteFail: Story = {
	args: {
		isExecuting: false,
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
