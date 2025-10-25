// frontend/src/pages/ChartsPage.jsx (FINAL FIXED CODE)

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import {
  Alert,
  Box,
  CircularProgress,
  Grid,
  Paper,
  Typography,
  useTheme, // ✅ IMPORTED: Use theme for dynamic colors
} from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchTasks } from "../utils/api";

// -----------------------------------------------------------
// 1. Data Processing Logic (UNCHANGED)
// -----------------------------------------------------------

const getStatusSummary = (tasks) => {
  const counts = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});

  return [
    {
      id: "Completed",
      label: "Completed",
      value: counts.Completed || 0,
      color: "#4caf50",
    },
    {
      id: "In Progress",
      label: "In Progress",
      value: counts["In Progress"] || 0,
      color: "#ff9800",
    },
    {
      id: "Pending",
      label: "Pending",
      value: counts.Pending || 0,
      color: "#f44336",
    },
  ];
};

const getPrioritySummary = (tasks) => {
  const counts = tasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {});

  return [
    { priority: "High", count: counts.High || 0, color: "#f44336" }, // Red
    { priority: "Medium", count: counts.Medium || 0, color: "#ff9800" }, // Orange
    { priority: "Low", count: counts.Low || 0, color: "#2196f3" }, // Blue
  ];
};

const getTypeStatusSummary = (tasks) => {
  const typeStatusMap = tasks.reduce((acc, task) => {
    const type = task.type || "Other";
    const status = task.status || "Pending";

    if (!acc[type]) {
      acc[type] = { type };
    }
    acc[type][status] = (acc[type][status] || 0) + 1;
    return acc;
  }, {});

  return Object.values(typeStatusMap).map((data) => ({
    ...data,
    Completed: data.Completed || 0,
    "In Progress": data["In Progress"] || 0,
    Pending: data.Pending || 0,
  }));
};

// -----------------------------------------------------------
// 2. Main Component & Sub-Components (FIXED)
// -----------------------------------------------------------

// A simple component to display key metrics (UNCHANGED)
const StatCard = ({ title, value, icon, color }) => (
  <Paper
    elevation={6}
    sx={{
      p: 3,
      display: "flex",
      alignItems: "center",
      height: "100%",
      borderLeft: `5px solid ${color}`,
      transition: "box-shadow 0.3s, transform 0.3s",
      "&:hover": {
        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
        transform: "translateY(-4px)",
      },
    }}
  >
    <Box sx={{ color: color, mr: 2, fontSize: 40, display: "flex" }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="h5" component="div" fontWeight="bold">
        {value}
      </Typography>
      <Typography variant="subtitle2" color="text.secondary">
        {title}
      </Typography>
    </Box>
  </Paper>
);

// ✅ FIXED ChartPaper to use dynamic colors for text and background
const ChartPaper = ({ title, totalTasks, children, dynamicColors }) => (
  <Paper
    elevation={4}
    sx={{
      p: 2,
      height: 450,
      transition: "box-shadow 0.3s, transform 0.3s",
      bgcolor: dynamicColors.PAPER_BG, // Use dynamic background color
      "&:hover": {
        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.25)",
        transform: "scale(1.02)",
      },
    }}
  >
    <Typography variant="h6" gutterBottom color={dynamicColors.PRIMARY_TEXT}>
      {title}
      {totalTasks !== undefined && (
        <Typography
          component="span"
          variant="body2"
          color={dynamicColors.SECONDARY_TEXT}
          sx={{ ml: 1 }}
        >
          (Total: {totalTasks})
        </Typography>
      )}
    </Typography>
    <Box sx={{ height: "calc(100% - 30px)" }}>{children}</Box>
  </Paper>
);

export default function ChartsPage() {
  const { user } = useAuth();
  const theme = useTheme(); // ✅ Get MUI Theme object
  const isDark = theme.palette.mode === "dark";

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dynamic Colors based on Dark/Light Mode
  const dynamicColors = {
    // Check for dark mode to set a slightly different paper background if needed,
    // otherwise use the default paper background from the MUI theme.
    PAPER_BG: isDark
      ? theme.palette.background.paper
      : theme.palette.background.paper,
    PRIMARY_TEXT: theme.palette.text.primary,
    SECONDARY_TEXT: theme.palette.text.secondary,
  };

  // ✅ FIX: Nivo Theme Configuration for Dark Mode Text Visibility
  // This object controls the color of all Nivo chart text elements (axis, legend, ticks, tooltips)
  const NIVO_THEME = useMemo(
    () => ({
      axis: {
        domain: {
          line: {
            stroke: isDark ? "#ffffff" : "#777777",
            strokeWidth: 1,
          },
        },
        legend: {
          text: {
            fill: isDark ? "#ffffff" : "#333333",
          },
        },
        ticks: {
          line: {
            stroke: isDark ? "#ffffff" : "#777777",
            strokeWidth: 1,
          },
          text: {
            fill: isDark ? "#ffffff" : "#333333", // Y/X-axis values (crucial)
          },
        },
      },
      legends: {
        text: {
          fill: isDark ? "#ffffff" : "#333333", // Legend text color (crucial)
        },
      },
      tooltip: {
        container: {
          background: isDark ? "#333333" : "#ffffff",
          color: isDark ? "#ffffff" : "#333333", // Tooltip text
        },
      },
      grid: {
        line: {
          stroke: isDark ? "#444444" : "#dddddd",
        },
      },
    }),
    [isDark]
  );

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const data = await fetchTasks();
        const sanitizedData = data.map((task) => ({
          ...task,
          type: task.type || "Task",
        }));
        setTasks(sanitizedData);
      } catch (err) {
        console.error("Error fetching tasks for charts:", err);
        setError("Failed to load task data for charts.");
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);

  const statusData = useMemo(() => getStatusSummary(tasks), [tasks]);
  const priorityData = useMemo(() => getPrioritySummary(tasks), [tasks]);
  const typeStatusData = useMemo(() => getTypeStatusSummary(tasks), [tasks]);
  const totalTasks = tasks.length;
  const completedTasks =
    statusData.find((d) => d.id === "Completed")?.value || 0;
  const pendingTasks = statusData.find((d) => d.id === "Pending")?.value || 0;
  const progressTasks =
    statusData.find((d) => d.id === "In Progress")?.value || 0;
  const completionRate =
    totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0;

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 4, p: 6 }}>
      {/* Page Title and Subtitle use dynamic colors */}
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        color={dynamicColors.PRIMARY_TEXT}
      >
        Task Visual Analytics ✨
      </Typography>
      <Typography
        variant="body1"
        color={dynamicColors.SECONDARY_TEXT}
        sx={{ mb: 4 }}
      >
        Comprehensive visual breakdown of your personal tasks and events.
      </Typography>

      {/* Stat Cards (UNCHANGED) */}
      <Grid container spacing={9} sx={{ mb: 8 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tasks & Events"
            value={totalTasks}
            icon={<TrendingUpIcon fontSize="inherit" />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed"
            value={`${completedTasks} (${completionRate}%)`}
            icon={<CheckCircleOutlineIcon fontSize="inherit" />}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="In Progress"
            value={progressTasks}
            icon={<HourglassEmptyIcon fontSize="inherit" />}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending"
            value={pendingTasks}
            icon={<WatchLaterIcon fontSize="inherit" />}
            color="#f44336"
          />
        </Grid>
      </Grid>

      {/* CHARTS LAYOUT */}
      <Grid container spacing={10}>
        {/* 1. Task Status Pie Chart */}
        <Grid item xs={12} md={4}>
          <ChartPaper
            title="Task Completion Status"
            totalTasks={totalTasks}
            dynamicColors={dynamicColors}
          >
            <ResponsivePie
              data={statusData}
              theme={NIVO_THEME} // ✅ APPLY NIVO THEME HERE for axis and legends
              margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
              innerRadius={0.6}
              padAngle={2}
              cornerRadius={8}
              colors={{ datum: "data.color" }}
              borderWidth={4}
              borderColor={{ from: "color", modifiers: [["darker", 0.7]] }}
              arcLinkLabelsSkipAngle={10}
              // ✅ FIX: Dynamic arcLinkLabelsTextColor
              arcLinkLabelsTextColor={
                isDark ? dynamicColors.PRIMARY_TEXT : "#333333"
              }
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: "color" }}
              arcLabelsSkipAngle={10}
              // arcLabelsTextColor will be dynamically computed by Nivo, using modifiers to contrast with slice color
              arcLabelsTextColor={{
                from: "color",
                modifiers: [["darker", 2]],
              }}
              isInteractive={true}
              motionConfig="wobbly"
              activeOuterRadiusOffset={10}
            />
          </ChartPaper>
        </Grid>

        {/* 2. Task Priority Bar Chart */}
        <Grid item xs={12} md={4}>
          <ChartPaper
            title="Tasks by Priority Level"
            dynamicColors={dynamicColors}
          >
            <ResponsiveBar
              data={priorityData}
              keys={["count"]}
              indexBy="priority"
              theme={NIVO_THEME} // ✅ APPLY NIVO THEME HERE for axis and labels
              margin={{ top: 50, right: 60, bottom: 50, left: 60 }}
              padding={0.25}
              valueScale={{ type: "linear" }}
              indexScale={{ type: "band", round: true }}
              colors={(d) => d.data.color}
              borderRadius={4}
              borderWidth={2}
              borderColor={{ from: "color", modifiers: [["darker", 1.2]] }}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "Priority Level",
                legendPosition: "middle",
                legendOffset: 32,
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "Task Count",
                legendPosition: "middle",
                legendOffset: -40,
              }}
              enableLabel={true}
              labelSkipWidth={12}
              labelSkipHeight={12}
              // Label text color will be controlled by Nivo's `labelTextColor` combined with `NIVO_THEME`
              labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
              isInteractive={true}
              animate={true}
              motionConfig="wobbly"
            />
          </ChartPaper>
        </Grid>

        {/* 3. Task Type vs Status Stacked Bar/Column Chart */}
        <Grid item xs={12} md={4}>
          <ChartPaper
            title="Task & Event Progress by Type"
            dynamicColors={dynamicColors}
          >
            <ResponsiveBar
              data={typeStatusData}
              keys={["Completed", "In Progress", "Pending"]}
              indexBy="type"
              theme={NIVO_THEME} // ✅ APPLY NIVO THEME HERE for axis and legends
              margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
              padding={0.25}
              colors={["#4caf50", "#ff9800", "#f44336"]}
              valueScale={{ type: "linear" }}
              indexScale={{ type: "band", round: true }}
              groupMode="stacked"
              borderRadius={4}
              borderWidth={2}
              borderColor={{ from: "color", modifiers: [["darker", 1.2]] }}
              legends={[
                {
                  dataFrom: "keys",
                  anchor: "bottom-right",
                  direction: "column",
                  translateX: 120,
                  itemWidth: 100,
                  itemHeight: 20,
                  symbolSize: 12,
                  symbolShape: "circle",
                },
              ]}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "Task/Event Type",
                legendPosition: "middle",
                legendOffset: 32,
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "Total Count",
                legendPosition: "middle",
                legendOffset: -40,
              }}
              enableLabel={false}
              isInteractive={true}
              animate={true}
              motionConfig="wobbly"
            />
          </ChartPaper>
        </Grid>
      </Grid>
    </Box>
  );
}
