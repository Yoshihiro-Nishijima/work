import {
	Box,
	List,
	ListItemButton,
	ListItemText,
	Stack,
	Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";

import { Menu, MenuItem } from "@mui/material";
import { Toast } from "~/components/elements/Toast";
import { useRecipeModeParam, useSelectedAreaNo } from "~/features/recipe/hooks";
import { useAreaNos } from "~/features/recipe/hooks/useAreaNos";
import { useCopyAllParam } from "../../hooks/useCopyAllParam";

const SUCCESS_MESSAGE = "Successfully executed Apply All.";

export const AreaList = (): JSX.Element => {
	const { areaNos } = useAreaNos();
	const { selectedAreaNo, setSelectedAreaNo } = useSelectedAreaNo();
	const { resetEditAreaNos, setRecipeModeParam } = useRecipeModeParam();
	const { copyAllParams } = useCopyAllParam();
	const [toastOpen, setToastOpen] = useState(false);

	const [contextMenu, setContextMenu] = useState<
		| {
				areaNo: number;
				mouseX: number;
				mouseY: number;
		  }
		| undefined
	>(undefined);
	const menuPaperRef = useRef<HTMLDivElement>(null);

	const areaRef = useRef<HTMLDivElement>(null);
	const [displayPosition, setDisplayPosition] = useState({
		top: "0px",
		left: "0px",
	});

	useEffect(() => {
		if (!toastOpen || !areaRef.current) return;
		const rect = areaRef.current.getBoundingClientRect();
		setDisplayPosition({
			top: `${rect.top + 50}px`,
			left: `${rect.left + 60}px`,
		});
	}, [toastOpen]);

	useEffect(() => {
		setRecipeModeParam();
	}, [setRecipeModeParam]);

	useEffect(() => {
		// 編集中Areaリストリセット
		resetEditAreaNos();
		// Areaリスト再取得時は先頭を選択状態にする(isReadonly=falseの場合)
		if (areaNos.length > 0) setSelectedAreaNo(areaNos[0]);
	}, [areaNos, resetEditAreaNos, setSelectedAreaNo]);

	const handleListItemClick = (areaNo: number): void => {
		setSelectedAreaNo(areaNo);
	};

	const toastTrigger = {
		isOpen: toastOpen,
		onClose: () => setToastOpen(false),
	};

	// 右クリックでメニュー表示
	const handleContextMenu = (
		event: React.MouseEvent<HTMLElement>,
		areaNo: number,
	) => {
		event.preventDefault();
		setContextMenu(
			contextMenu == null
				? { areaNo, mouseX: event.clientX - 2, mouseY: event.clientY - 4 }
				: undefined,
		);
	};

	const handleClose = () => {
		setContextMenu(undefined);
	};

	// コンテキストメニュー選択時アクション
	const handleClickApplyAll = async (): Promise<void> => {
		setToastOpen(false);
		if (contextMenu?.areaNo != null) {
			await copyAllParams();
			// 一括適用反映結果トースト表示
			setToastOpen(true);
		}
		handleClose();
	};

	return (
		<Stack sx={{ width: "4em", Height: "100%" }} ref={areaRef}>
			<Box
				justifyContent="center"
				sx={{ height: 36, display: "flex", alignItems: "center" }}
				borderBottom={1}
				borderColor="grey.300"
			>
				<Typography>Area</Typography>
			</Box>
			<List
				sx={{
					position: "relative",
					overflow: "auto",
					maxHeight: "500px",
					padding: "0",
				}}
			>
				{areaNos.map((areaNo: number) => (
					<ListItemButton
						alignItems="center"
						divider
						key={areaNo}
						selected={selectedAreaNo === areaNo}
						onClick={() => handleListItemClick(areaNo)}
						onContextMenu={(e) => handleContextMenu(e, areaNo)}
					>
						<ListItemText sx={{ textAlign: "right" }} primary={areaNo} />
					</ListItemButton>
				))}
			</List>
			<Menu
				open={contextMenu != null}
				onClose={handleClose}
				anchorReference="anchorPosition"
				anchorPosition={
					contextMenu != null
						? { top: contextMenu.mouseY, left: contextMenu.mouseX }
						: undefined
				}
				slotProps={{
					root: {
						onContextMenu: (e) => {
							e.preventDefault();
							handleClose();
						},
					},
					paper: { ref: menuPaperRef },
				}}
			>
				<MenuItem onClick={() => handleClickApplyAll()}>Apply All</MenuItem>
			</Menu>
			<Toast
				message={SUCCESS_MESSAGE}
				trigger={toastTrigger}
				anchorOrigin={{ vertical: "top", horizontal: "left" }}
				displayPosition={displayPosition}
			/>
		</Stack>
	);
};
