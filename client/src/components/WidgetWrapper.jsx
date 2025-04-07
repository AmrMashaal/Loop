import { Box } from "@mui/material";
import { styled } from "@mui/system";

const WidgetWrapper = styled(Box)(({ theme }) => ({
  padding: "14px 25px",
  background: "radial-gradient(circle at top left, #4a366a4a, #2d1e4661)",
  borderRadius: "0.75rem",
}));

export default WidgetWrapper;
