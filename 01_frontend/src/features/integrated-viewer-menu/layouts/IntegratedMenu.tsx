import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ListIcon from "@mui/icons-material/List";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { type CSSObject, type Theme, styled } from "@mui/material/styles";
import { useEffect, useState } from "react";

import { useListDrawerInfo } from "~/features/integrated-viewer-map/hooks/useListDrawerInfo";
import { INTEGRATED_VIEWER_MAP_TITLEBAR_HEIGHT } from "~/features/integrated-viewer-map/hooks/useMapAreaInfo";
import { ListSection } from "../../misc/layouts/ListSection";

const menuWidth = 189;
const minDrawerWidth = 200;
const maxDrawerWidth = 1300;

const draggerStyle = {
	width: "5px",
	cursor: "ew-resize",
	padding: "4px 0 0",
	borderTop: "1px solid #ddd",
	position: "absolute",
	top: 0,
	right: 0,
	bottom: 0,
	zIndex: 100,
	backgroundColor: "#f4f7f9",
};

const openedMixin = (theme: Theme, drawerWidth: number): CSSObject => ({
	width: drawerWidth,
	transition: theme.transitions.create("width", {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.enteringScreen,
	}),
	overflowX: "hidden",
});

const closedMixin = (theme: Theme, spacing: number): CSSObject => ({
	transition: theme.transitions.create("width", {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	overflowX: "hidden",
	width: `calc(${theme.spacing(spacing)} + 1px)`,
});

const Drawer = styled(MuiDrawer, {
	shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
	width: menuWidth,
	flexShrink: 0,
	whiteSpace: "nowrap",
	boxSizing: "border-box",
	...(open === true && {
		...openedMixin(theme, menuWidth),
		"& .MuiDrawer-paper": openedMixin(theme, menuWidth),
	}),
	...(open === false && {
		...closedMixin(theme, 7),
		"& .MuiDrawer-paper": closedMixin(theme, 7),
	}),
}));

const ListDrawer = styled(MuiDrawer, {
	shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
	flexShrink: 0,
	whiteSpace: "nowrap",
	boxSizing: "border-box",
	...(open === false && {
		...closedMixin(theme, 0),
		"& .MuiDrawer-paper": closedMixin(theme, 0),
	}),
}));

const menuText = ["Lists"] as const;
const MenuIconMap = new Map<string, JSX.Element>([
	[menuText[0], <ListIcon key={menuText[0]} />],
]);

type MenuText = (typeof menuText)[number];

export const IntegratedMenu = (): JSX.Element => {
	const [isMenuOpen, setMenuOpen] = useState(false);
	const [isSizeChanging, setSizeChanging] = useState(false);
	const {
		isListDrawerOpen,
		setListDrawerOpen,
		listDrawerWidth,
		setListDrawerWidth,
	} = useListDrawerInfo();

	const handleDrawerMenuClick = (): void => {
		setMenuOpen((prev) => !prev);
	};

	const handleMenuItemClick = (
		menuText: MenuText,
		event: React.MouseEvent,
	): void => {
		if (menuText === "Lists") {
			setListDrawerOpen((prev) => !prev);
		}
		event.stopPropagation();
	};

	const handleListMouseDown = (): void => {
		// ドラッグによるリスト幅変更を有効化
		setSizeChanging(true);
	};
	useEffect(() => {
		// リスト幅変更操作用のマウスイベントリスナ登録
		const handleMouseMove = (e: MouseEvent): void => {
			if (!isSizeChanging) return;
			e.preventDefault();
			const newWidth = e.clientX - document.body.offsetLeft + 1;
			if (newWidth > minDrawerWidth && newWidth < maxDrawerWidth) {
				setListDrawerWidth(newWidth);
			}
		};
		const handleMouseUp = (): void => {
			setSizeChanging(false);
		};
		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
		return () => {
			document.removeEventListener("mouseup", handleMouseUp);
			document.removeEventListener("mousemove", handleMouseMove);
		};
	}, [isSizeChanging, setListDrawerWidth]);

	return (
		<Box sx={{ display: "flex" }}>
			<Drawer
				variant="permanent"
				open={isMenuOpen}
				onClick={() => {
					handleDrawerMenuClick();
				}}
			>
				<Box height={INTEGRATED_VIEWER_MAP_TITLEBAR_HEIGHT} />
				<List>
					{menuText.map((menuText) => (
						<ListItem key={menuText} disablePadding sx={{ display: "block" }}>
							<ListItemButton
								onClick={(event) => handleMenuItemClick(menuText, event)}
								sx={{
									minHeight: 48,
									justifyContent: isMenuOpen ? "initial" : "center",
									px: 2.5,
								}}
								title={menuText}
							>
								<ListItemIcon
									sx={{
										minWidth: 0,
										mr: isMenuOpen ? 3 : "auto",
										justifyContent: "center",
									}}
								>
									{MenuIconMap.get(menuText)}
								</ListItemIcon>
								{isMenuOpen && <ListItemText primary={menuText} />}
							</ListItemButton>
						</ListItem>
					))}
				</List>
				<Box
					sx={{
						display: "flex",
						justifyContent: "center",
						alignItems: "flex-end",
						pb: 1,
						height: "100%",
					}}
				>
					<ExpandMoreIcon
						style={{
							transform: isMenuOpen ? "rotate(90deg)" : "rotate(270deg)",
						}}
					/>
				</Box>
			</Drawer>
			<ListDrawer
				variant="permanent"
				open={isListDrawerOpen}
				sx={{ zIndex: (theme) => theme.zIndex.drawer - 1 }}
				PaperProps={{
					style: {
						width: isListDrawerOpen ? listDrawerWidth : 0,
						userSelect: isSizeChanging ? "none" : "auto",
					},
				}}
			>
				<Box onMouseDown={handleListMouseDown} sx={draggerStyle} />
				<Box
					role="presentation"
					sx={{
						height: `calc(100% - ${INTEGRATED_VIEWER_MAP_TITLEBAR_HEIGHT}px)`,
						width: "calc(100% - 5px)",
					}}
				>
					<ListSection />
				</Box>
			</ListDrawer>
		</Box>
	);
};
