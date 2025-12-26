import { Box } from "@mui/material";
import { styled } from "@mui/system";

const WidgetWrapper = styled(Box)(({ theme, isPost }) => ({
  padding: !isPost ? "14px 25px" : undefined,
  background: theme.palette.background.alt,
  position: "relative",
  "::before": {
    content: isPost ? '""' : undefined,
    position: "absolute",
    top: "0",
    left: "0",
    height: "100px",
    width: "1px",
    background: "linear-gradient(180deg, #4a366a, transparent)",
  },
  "::after": {
    content: isPost ? '""' : undefined,
    position: "absolute",
    top: "0",
    left: "0",
    height: "1px",
    width: "100px",
    background: "linear-gradient(45deg, #4a366a, transparent);",
  },
}));

export default WidgetWrapper;
