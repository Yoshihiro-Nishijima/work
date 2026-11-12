import { Stack } from "@mui/system";

import { TitleBar } from "~/components/elements";

import { useReTestRun } from "~/features/recipe/hooks/useReTestRun";
import { useTestRunState } from "~/features/recipe/hooks/useTestRunState";
import { SFovView } from "../components/SFovView";
import { TestRunMenu } from "../components/TestRunMenu";
import { TestRunSFovMap } from "../components/TestRunSFovMap";

export const TestRunSFovImage = (): JSX.Element => {
	const { testRunProcessedCount } = useReTestRun();
	const { testRunId, sFov } = useTestRunState();

	return (
		<Stack sx={{ width: "100%", height: "100%" }}>
			<TitleBar title="s FOV Image" sx={{ height: 24 }} />
			<TestRunMenu />
			<SFovView
				mfovno={sFov?.mfovNo}
				sfovno={sFov?.sfovNo}
				testRunId={testRunId}
				testRunProcessedCount={testRunProcessedCount}
			/>
			<div style={{ position: "absolute", right: 30, bottom: 25, zIndex: 20 }}>
				<TestRunSFovMap />
			</div>
		</Stack>
	);
};
