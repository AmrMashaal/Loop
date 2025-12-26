/* eslint-disable react/prop-types */
import { Typography } from "@mui/material";
import { formatTextForDisplay } from "../../frequentFunctions";
import DOMPurify from "dompurify";
import { useEffect, useRef, useState } from "react";

const PostText = ({ ele, textAddition, howIsText, mode, testArabic }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isToggle, setIsToggle] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    if (textRef.current) {
      const { scrollHeight, clientHeight } = textRef.current;
      if (scrollHeight > clientHeight) {
        setIsExpanded(true);
      }
    }
  }, [textRef?.current, textRef?.current?.scrollHeight]);

  return (
    <>
      <Typography
        position="relative"
        id={ele?._id}
        fontWeight={textAddition?.value === "bold" && "bold"}
        fontSize={
          typeof ele?.postId === "object"
            ? "14px"
            : howIsText(ele?.description, ele?.picturePath, textAddition)
        }
        color={
          textAddition?.value ===
            "linear-gradient(to right, #89003054, #007a3342, #00000000)" &&
          mode === "light" &&
          "black"
        }
        textTransform={
          textAddition?.value === "quotation"
            ? "capitalize"
            : textAddition?.value === "uppercase"
            ? "uppercase"
            : undefined
        }
        sx={{
          transition: "0.3s",
          wordBreak: "break-word",
          lineHeight: "1.7",
          direction: testArabic(ele?.description) && "rtl",
          textAlign: textAddition.type === "color",
          p: textAddition?.value === "quotation" && "10px",
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
          overflow: isToggle ? "unset" : "hidden",
          maxHeight: isToggle ? "0" : "150px",
        }}
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(formatTextForDisplay(ele?.description), {
            ADD_ATTR: ["target", "rel"],
          }),
        }}
        className={`${!isToggle && "truncated-text"} ${
          textAddition?.value === "quotation" && "postText"
        }`}
        ref={textRef}
      />

      {isExpanded && (
        <span
          style={{
            fontWeight: "600",
            cursor: "pointer",
            userSelect: "none",
          }}
          onClick={() => {
            setIsToggle(!isToggle);
          }}
        >
          {isToggle ? "Show Less" : "...Show More"}
        </span>
      )}
    </>
  );
};

export default PostText;
