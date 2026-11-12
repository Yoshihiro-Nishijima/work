import type { Meta, StoryObj } from "@storybook/react";
import { type ComponentProps, useEffect, useState } from "react";

import {
	type showSEMType,
	useImageViewProp,
	useShowImage,
} from "~/features/misc/hooks/mocks/useImageViewProp.mock";
import { useResultJobType } from "~/features/misc/hooks/mocks/useResultsJobType.mock";

import { Menu } from "../Menu";

type Props = ComponentProps<typeof Menu> & {
	enableDefect: boolean;
	enableDesign: boolean;
	showRoi: boolean;
	showDefect: boolean;
	defectAlpha: number;
	semAlpha: number;
	showDesignData: boolean;
	magnification: number;
	showScale: boolean;
	isHiddenSem: boolean;
	showCrossData: boolean;
};

const MenuMock = (props: Props): JSX.Element => {
	const [showRoi, setShowRoi] = useState(props.showRoi);
	const [showDefect, setShowDefect] = useState(props.showDefect);
	const [defectAlpha, setDefectAlpha] = useState(props.defectAlpha);
	const [semAlpha, setSemAlpha] = useState(props.semAlpha);
	const [showDesignData, setShowDesignData] = useState(props.showDesignData);
	const [magnification, setMagnification] = useState(props.magnification);
	const [showScale, setShowScale] = useState(props.showScale);
	const [isHiddenSem, setIsHiddenSem] = useState(props.isHiddenSem);
	const [showImage, setShowImage] = useState<
		"sem" | "potential" | "intermediate" | "none"
	>("sem");
	const [showSEM, setShowSEM] = useState<showSEMType>("target");
	const [showCrossData, setShowCrossData] = useState(props.showCrossData);

	useResultJobType.mockReturnValue({
		enableDefect: props.enableDefect,
		enableDesign: props.enableDesign,
		enableBoxSegment: false,
		enableIntermediate: false,
		hasReferences: false,
	});

	useImageViewProp.mockReturnValue({
		imageViewProp: {
			showRoi,
			showDefect,
			defectAlpha,
			semAlpha,
			showDesignData,
			magnification,
			showScale,
			showBoxSegmentData: true,
			viewW: 0,
			viewH: 0,
			centerX: 0,
			centerY: 0,
			imageType: "target",
			showCrossData,
		},
		setMagnification,
		setViewWH: (value: number) => ({}),
		setCenterXY: (value: number) => ({}),
		setShowRoi,
		setShowDefect,
		setDefectAlpha,
		setSemAlpha,
		setShowDesignData,
		setShowScale,
		setShowBoxSegmentData: (value: boolean) => ({}),
		setImageType: () => {},
		setShowCrossData,
	});

	useShowImage.mockReturnValue({
		isHiddenSem,
		isHiddenPotential: false,
		isHiddenIntermediate: false,
		showImageType: showImage,
		setShowImage: (value) => {
			setShowImage(value as "sem" | "potential" | "intermediate" | "none");
			setIsHiddenSem(showImage !== "sem");
		},
		showSEMType: showSEM,
		setShowSEM: (value) => {
			setShowSEM(value as showSEMType);
		},
		semAlpha: 0,
	});

	useEffect(() => {
		setShowRoi(props.showRoi);
	}, [props.showRoi]);
	useEffect(() => {
		setShowDefect(props.showDefect);
	}, [props.showDefect]);
	useEffect(() => {
		setDefectAlpha(props.defectAlpha);
	}, [props.defectAlpha]);
	useEffect(() => {
		setSemAlpha(props.semAlpha);
	}, [props.semAlpha]);
	useEffect(() => {
		setShowDesignData(props.showDesignData);
	}, [props.showDesignData]);
	useEffect(() => {
		setMagnification(props.magnification);
	}, [props.magnification]);
	useEffect(() => {
		setShowScale(props.showScale);
	}, [props.showScale]);
	useEffect(() => {
		setIsHiddenSem(props.isHiddenSem);
	}, [props.isHiddenSem]);
	useEffect(() => {
		setIsHiddenSem(showImage !== "sem");
	}, [showImage]);
	useEffect(() => {
		setShowCrossData(props.showCrossData);
	}, [props.showCrossData]);

	return <Menu />;
};

const meta = {
	component: MenuMock,
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof MenuMock>;

export const Default: Story = {
	args: {
		enableDefect: true,
		enableDesign: true,
		showRoi: false,
		showDefect: false,
		defectAlpha: 0,
		semAlpha: 0,
		showDesignData: true,
		magnification: 0.2,
		showScale: false,
		isHiddenSem: false,
		showCrossData: true,
	},
	argTypes: {
		defectAlpha: {
			description: "0～100",
		},
		semAlpha: {
			description: "0～100",
		},
		magnification: {
			control: { type: "number", step: 0.1 },
			description: "0.1～30 <br> 100倍した値を表示",
		},
	},
};
