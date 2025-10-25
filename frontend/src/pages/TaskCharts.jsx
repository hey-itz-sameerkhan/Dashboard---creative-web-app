// frontend/src/pages/TaskCharts.jsx
// This file contains the Nivo chart components used by Dashboard.jsx.
// ✅ UPDATED for Dynamic Theming AND Mobile Responsiveness (using useMediaQuery).

import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import { ResponsivePie } from "@nivo/pie";
import React from "react";

// ------------------------------------
// Nivo Theme Builder (Dynamic)
// ------------------------------------
const getNivoTheme = (theme, themeColors) => {
  const isDark = themeColors.mode === "dark";
  const textColor = themeColors.MAIN_TEXT_COLOR;
  const secondaryTextColor = themeColors.SECONDARY_TEXT_COLOR;
  const gridColor = isDark ? themeColors.BORDER_COLOR : theme.palette.grey[200];
  const dividerColor = isDark
    ? themeColors.BORDER_COLOR
    : theme.palette.divider;

  return {
    axis: {
      domain: { line: { stroke: dividerColor } },
      ticks: {
        line: { stroke: dividerColor },
        text: { fill: secondaryTextColor },
      },
      legend: { text: { fill: textColor } },
    },
    grid: { line: { stroke: gridColor } },
    labels: { text: { fill: textColor } },
    legends: { text: { fill: secondaryTextColor } },
    tooltip: {
      container: {
        background: isDark
          ? themeColors.CARD_BG_COLOR
          : theme.palette.background.paper,
        color: textColor,
        boxShadow: isDark ? theme.shadows[4] : theme.shadows[2],
      },
    },
  };
};

// ------------------------------------
// 1. ResponsiveLineChart Component
// ------------------------------------
export const ResponsiveLineChart = ({ data, themeColors }) => {
  const theme = useTheme();
  const NIVO_THEME = getNivoTheme(theme, themeColors);
  const legendTextColor = themeColors.SECONDARY_TEXT_COLOR;
  // ✅ RESPONSIVE CHECK
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // ✅ RESPONSIVE NIVO PROPS
  const margin = isMobile
    ? { top: 10, right: 10, bottom: 40, left: 40 } // Reduced margin for mobile
    : { top: 20, right: 30, bottom: 50, left: 60 };
  const axisLeftLegendOffset = isMobile ? -30 : -40;
  const axisBottomLegendOffset = isMobile ? 25 : 36;
  const legendTranslateX = isMobile ? 60 : 100;

  return (
    <ResponsiveLine
      data={data}
      margin={margin} // ✅ Dynamic Margin
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: "auto",
        max: "auto",
        stacked: false,
        reverse: false,
      }}
      yFormat=" >-.2f"
      curve="monotoneX"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "Month",
        legendOffset: axisBottomLegendOffset, // ✅ Dynamic Offset
        legendPosition: "middle",
        truncateTickAt: 0,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "Completed Tasks",
        legendOffset: axisLeftLegendOffset, // ✅ Dynamic Offset
        legendPosition: "middle",
        truncateTickAt: 0,
      }}
      enableGridX={false}
      colors={[theme.palette.success.main]}
      lineWidth={4}
      pointSize={8}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      enableArea={true}
      areaOpacity={0.15}
      motionConfig="stiff"
      theme={NIVO_THEME}
      legends={[
        {
          anchor: "bottom-right",
          direction: "row",
          justify: false,
          translateX: legendTranslateX, // ✅ Dynamic TranslateX
          translateY: 0,
          itemsSpacing: 0,
          itemDirection: "left-to-right",
          itemWidth: 80,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: "circle",
          symbolBorderColor:
            themeColors.mode === "dark"
              ? themeColors.SECONDARY_TEXT_COLOR
              : "rgba(0, 0, 0, .5)",
          itemTextColor: legendTextColor,
        },
      ]}
    />
  );
};

// ------------------------------------
// 2. ResponsivePieChart Component
// ------------------------------------
export const ResponsivePieChart = ({
  data,
  subtitle = "Status",
  themeColors,
}) => {
  const theme = useTheme();
  const NIVO_THEME = getNivoTheme(theme, themeColors);
  // ✅ RESPONSIVE CHECK
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // ✅ RESPONSIVE NIVO PROPS
  const margin = isMobile
    ? { top: 20, right: 20, bottom: 60, left: 20 } // Reduced margin for mobile
    : { top: 20, right: 80, bottom: 80, left: 80 };

  return (
    <Box sx={{ height: "100%", position: "relative" }}>
      <ResponsivePie
        data={data}
        margin={margin} // ✅ Dynamic Margin
        innerRadius={0.75}
        padAngle={1.5}
        cornerRadius={4}
        colors={{ datum: "data.color" }}
        borderWidth={1}
        borderColor={{ from: "color", modifiers: [["darker", 0.7]] }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor={themeColors.SECONDARY_TEXT_COLOR}
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: "color" }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{
          from: "color",
          modifiers: [["darker", 2]],
        }}
        enableArcLabels={false}
        isInteractive={true}
        motionConfig="gentle"
        activeOuterRadiusOffset={10}
        theme={NIVO_THEME}
        legends={[
          {
            anchor: "bottom",
            direction: "row",
            // ✅ Reduced item width for mobile to save space
            itemWidth: isMobile ? 60 : 80,
            itemHeight: 18,
            symbolShape: "circle",
            symbolSize: 10,
            toggleSerie: true,
            itemTextColor: themeColors.SECONDARY_TEXT_COLOR,
            translateY: isMobile ? 20 : 40, // Reduced vertical offset
          },
        ]}
      />
      {/* Center Text - Responsive Font Size */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <Typography variant="caption" color={themeColors.SECONDARY_TEXT_COLOR}>
          Distribution
        </Typography>
        <Typography
          variant="h6"
          fontWeight={700}
          color={themeColors.MAIN_TEXT_COLOR}
          // ✅ Responsive Font Size for center text
          fontSize={{ xs: "1rem", sm: "1.25rem" }}
        >
          {subtitle}
        </Typography>
      </Box>
    </Box>
  );
};

// ------------------------------------
// 3. ResponsiveSimpleBarChart Component
// ------------------------------------
export const ResponsiveSimpleBarChart = ({ data, themeColors }) => {
  const theme = useTheme();
  const NIVO_THEME = getNivoTheme(theme, themeColors);
  // ✅ RESPONSIVE CHECK
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // ✅ RESPONSIVE NIVO PROPS
  const margin = isMobile
    ? { top: 10, right: 10, bottom: 40, left: 50 } // Reduced margin for mobile
    : { top: 20, right: 20, bottom: 50, left: 80 };
  const axisLeftLegendOffset = isMobile ? -30 : -40;

  return (
    <ResponsiveBar
      data={data}
      keys={["value"]}
      indexBy="id"
      margin={margin} // ✅ Dynamic Margin
      padding={0.3}
      valueScale={{ type: "linear" }}
      indexScale={{ type: "band", round: true }}
      colors={(d) => d.data.color}
      enableLabel={true}
      labelSkipWidth={12}
      labelTextColor={themeColors.MAIN_TEXT_COLOR}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "Task Priority",
        legendPosition: "middle",
        legendOffset: isMobile ? 25 : 32, // ✅ Dynamic Offset
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "Count",
        legendPosition: "middle",
        legendOffset: axisLeftLegendOffset, // ✅ Dynamic Offset
      }}
      theme={NIVO_THEME}
    />
  );
};

// ------------------------------------
// 4. ResponsiveStackedBarChart Component
// ------------------------------------
export const ResponsiveStackedBarChart = ({
  data,
  keys = ["Completed", "In Progress", "Pending"],
  indexBy = "type",
  themeColors,
}) => {
  const theme = useTheme();
  const NIVO_THEME = getNivoTheme(theme, themeColors);
  const legendTextColor = themeColors.SECONDARY_TEXT_COLOR;
  // ✅ RESPONSIVE CHECK
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // ✅ RESPONSIVE NIVO PROPS
  const margin = isMobile
    ? { top: 10, right: 10, bottom: 40, left: 50 } // Reduced margin for mobile
    : { top: 15, right: 30, bottom: 50, left: 60 };
  const axisLeftLegendOffset = isMobile ? -30 : -40;

  const colors = {
    Completed: theme.palette.success.main,
    "In Progress": theme.palette.info.main,
    Pending: theme.palette.error.main,
  };
  const getColor = (bar) => colors[bar.id] || theme.palette.grey[500];

  return (
    <ResponsiveBar
      data={data}
      keys={keys}
      indexBy={indexBy}
      groupMode="stacked"
      margin={margin} // ✅ Dynamic Margin
      padding={0.3}
      valueScale={{ type: "linear" }}
      indexScale={{ type: "band", round: true }}
      colors={getColor}
      borderColor={{
        from: "color",
        modifiers: [["darker", 1.6]],
      }}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "Type",
        legendPosition: "middle",
        legendOffset: isMobile ? 25 : 36, // ✅ Dynamic Offset
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "Count",
        legendPosition: "middle",
        legendOffset: axisLeftLegendOffset, // ✅ Dynamic Offset
      }}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={themeColors.MAIN_TEXT_COLOR}
      theme={NIVO_THEME}
      legends={[
        {
          dataFrom: "keys",
          anchor: "top-right",
          direction: "column",
          justify: false,
          translateX: isMobile ? -10 : 10, // Mobile par thoda andar
          translateY: 0,
          itemsSpacing: 2,
          itemWidth: isMobile ? 70 : 80, // Mobile par item width kam
          itemHeight: 20,
          itemDirection: "left-to-right",
          itemOpacity: 0.85,
          symbolSize: 18,
          itemTextColor: legendTextColor,
        },
      ]}
      role="application"
      ariaLabel="Nivo Stacked Bar Chart for Task/Event Breakdown"
    />
  );
};
