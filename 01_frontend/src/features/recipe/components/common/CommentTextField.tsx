import { TextField } from "@mui/material";
import { type ChangeEvent, useRef, useState } from "react";

import { VALID_ERROR_MESSAGE } from "~/config";
import { useRecipeCommonParams } from "~/features/recipe/hooks/useRecipeCommonParam";

export const CommentTextField = (): JSX.Element => {
	const { comment, setComment } = useRecipeCommonParams();
	const [commentError, setCommentError] = useState(false);
	const commentRef = useRef<HTMLInputElement>(null);

	const handleChange = (
		e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	): void => {
		setComment(e.target.value);
		if (commentRef.current != null) {
			setCommentError(!commentRef.current.validity.valid);
		}
	};

	return (
		<TextField
			label="Comment"
			variant="standard"
			value={comment}
			onChange={handleChange}
			error={commentError}
			inputProps={{ pattern: "^[a-zA-Z0-9_\\-]+$", maxLength: 40 }}
			inputRef={commentRef}
			helperText={commentError ? VALID_ERROR_MESSAGE : ""}
		/>
	);
};
