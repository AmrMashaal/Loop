import { Box } from "@mui/material";
import { styled } from "@mui/system";

const WidgetWrapper = styled(Box)(({ isPost }) => ({
  padding: !isPost ? "14px 25px" : undefined,
  background: "radial-gradient(circle at top left, #654f872b, #2d1e4600)",
  borderRadius: "0.75rem",
  border: `1px solid #4a366a`,
}));

export default WidgetWrapper;
