import { useTheme } from "@mui/system";

/* eslint-disable react/prop-types */
const CircleLength = ({ size = 50, stroke = 5, maxLength = 3000, text }) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const encodedLength = new TextEncoder().encode(text).length;

  const progress = Math.min((encodedLength / maxLength) * 100, 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const { palette } = useTheme();

  return (
    <svg width={size} height={size}>
      <circle
        stroke="#ddd"
        fill="transparent"
        strokeWidth={stroke}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />

      <circle
        stroke={progress < 100 ? "#1976d2" : "red"}
        fill="transparent"
        strokeWidth={stroke}
        r={radius}
        cx={size / 2}
        cy={size / 2}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.3s" }}
      />

      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="8"
        fill={progress < 100 ? palette.neutral.main : "red"}
        style={{ userSelect: "none" }}
      >
        {encodedLength}
      </text>
    </svg>
  );
};

export default CircleLength;
