import React, { useEffect } from "react";

import { Fieldset } from "~/components/layouts";

import { getUploadConfig, putUploadConfig } from "../api";
import { KlarfVersionRadio } from "../components/KlarfVersionRadio";
import { SaveButton } from "../components/SaveButton";
import { ToastAlert } from "../components/ToastAlert";
import { UploadDestinationGrid } from "../components/UploadDestinationGrid";
import { randomId } from "../hooks";
import type { KlarfVersion, Server, ServerRow } from "../types";

export const UploadSettings = (): JSX.Element => {
	const [successOpen, setSuccessOpen] = React.useState(false);
	const [failureOpen, setFailureOpen] = React.useState(false);
	const [klarfVersion, setKlarfVer] = React.useState<KlarfVersion>("1.2");
	const [serverRows, setServerRows] = React.useState<ServerRow[]>([]);
	const [saving, setSaving] = React.useState(false);

	useEffect(() => {
		getUploadConfig()
			.then((uploadConfig) => {
				setKlarfVer(uploadConfig.version);
				const newRows = uploadConfig.servers.map((row: Server) => {
					return { id: randomId(), isNew: false, ...row };
				});
				setServerRows(newRows);
			})
			.catch((reason) => {
				console.log("fail to get upload config. reason:", reason);
			});
	}, []);

	const saveClicked = (): void => {
		setSaving(true);
		putUploadConfig(klarfVersion, serverRows)
			.then((result) => {
				if (result) {
					setSuccessOpen(true);
				} else {
					setFailureOpen(true);
				}
			})
			.catch(() => {
				setFailureOpen(true);
			})
			.finally(() => {
				setSaving(false);
			});
	};

	return (
		<Fieldset legend="Upload settings" sx={{ width: "fit-content" }}>
			<KlarfVersionRadio
				klarfVersion={klarfVersion}
				setKlarfVersion={setKlarfVer}
			/>
			<UploadDestinationGrid rows={serverRows} setRows={setServerRows} />
			<SaveButton onClick={saveClicked} loading={saving} />
			<ToastAlert
				opened={successOpen}
				setOpened={setSuccessOpen}
				severity="success"
			>
				Upload settings saved
			</ToastAlert>
			<ToastAlert
				opened={failureOpen}
				setOpened={setFailureOpen}
				severity="error"
			>
				Failed to save upload settings
			</ToastAlert>
		</Fieldset>
	);
};
