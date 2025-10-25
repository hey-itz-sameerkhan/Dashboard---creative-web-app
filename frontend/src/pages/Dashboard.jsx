// frontend/src/pages/Dashboard.jsx (FINAL MOBILE RESPONSIVE & DYNAMIC THEME)
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Grid,
  List,
  ListItem,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";

import React, { useEffect, useMemo, useState } from "react";
// ✅ LOCAL IMPORTS
import {
  ResponsiveLineChart,
  ResponsivePieChart,
  ResponsiveSimpleBarChart,
  ResponsiveStackedBarChart,
} from "./TaskCharts.jsx";
// ✅ RELATIVE IMPORTS
import { useAuth } from "../context/AuthContext.jsx";
import { fetchTasks } from "../utils/api";

// -----------------------------------------------------------
// 1. Dynamic Theme Constants (Based on Light/Dark Mode)
// -----------------------------------------------------------
const getThemeColors = (mode) => {
  if (mode === "dark") {
    return {
      BG_COLOR: "#121212",
      CARD_BG_COLOR: "#1f2a40",
      MAIN_TEXT_COLOR: "#ffffff",
      SECONDARY_TEXT_COLOR: "#a1a1a1",
      BORDER_COLOR: "#2e3a50",
    };
  } else {
    // Light Mode (Default)
    return {
      BG_COLOR: "#f4f6f8",
      CARD_BG_COLOR: "#ffffff",
      MAIN_TEXT_COLOR: "#333333",
      SECONDARY_TEXT_COLOR: "text.secondary",
      BORDER_COLOR: "#e0e0e0",
    };
  }
};

// -----------------------------------------------------------
// 2. Data Processing & Mock Data Generation (Utilities remain the same)
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
      color: "#2196f3",
    },
    {
      id: "Pending",
      label: "Pending",
      value: counts.Pending || 0,
      color: "#ff9800",
    },
  ];
};

const getPrioritySummary = (tasks) => {
  const counts = tasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {});

  return [
    { id: "High", label: "High", value: counts.High || 0, color: "#f44336" },
    {
      id: "Medium",
      label: "Medium",
      value: counts.Medium || 0,
      color: "#ff9800",
    },
    { id: "Low", label: "Low", value: counts.Low || 0, color: "#2196f3" },
  ];
};

const getTaskEventBreakdown = (tasks) => {
  const taskBreakdown = tasks.reduce((acc, task) => {
    const type = task.type || "Task";
    acc[type] = acc[type] || {
      type,
      Pending: 0,
      "In Progress": 0,
      Completed: 0,
    };
    if (task.status === "Pending") acc[type].Pending += 1;
    if (task.status === "In Progress") acc[type]["In Progress"] += 1;
    if (task.status === "Completed") acc[type].Completed += 1;
    return acc;
  }, {});

  const data = Object.values(taskBreakdown);

  if (!taskBreakdown.Task)
    data.push({ type: "Task", Pending: 0, "In Progress": 0, Completed: 0 });
  if (!taskBreakdown.Event)
    data.push({ type: "Event", Pending: 0, "In Progress": 0, Completed: 0 });

  data.sort((a, b) => a.type.localeCompare(b.type));

  return data;
};

const getMonthlyCompletionData = (tasks) => {
  const mockData = [
    { month: "Jan", Completed: 12 },
    { month: "Feb", Completed: 18 },
    { month: "Mar", Completed: 15 },
    { month: "Apr", Completed: 22 },
    { month: "May", Completed: 19 },
    { month: "Jun", Completed: 25 },
    { month: "Jul", Completed: 28 },
    { month: "Aug", Completed: 30 },
    { month: "Sep", Completed: 27 },
    { month: "Oct", Completed: 35 },
  ];

  return [
    {
      id: "Completed Tasks",
      color: "#4caf50",
      data: mockData.map((d) => ({ x: d.month, y: d.Completed })),
    },
  ];
};

const getRecentActivity = (tasks) => {
  const activeTasks = tasks.filter((t) => t.status !== "Completed");

  activeTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return activeTasks.slice(0, 5).map((task) => ({
    title: task.title || "No Title",
    status: task.status || "Pending",
    priority: task.priority || "Low",
    date: new Date(task.createdAt || Date.now()).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  }));
};

// -----------------------------------------------------------
// 3. Sub-Components (Dynamic Styles & Layout)
// -----------------------------------------------------------

// Small KPI Card - Added height: "100%" for consistent height in Grid
const KPICard = ({ title, value, icon, color, themeColors }) => (
  <Paper
    elevation={3}
    sx={{
      p: 2,
      height: "100%", // ✅ Ensure full height within the Grid item
      minHeight: 100, // Minimum height check
      bgcolor: themeColors.CARD_BG_COLOR,
      color: themeColors.MAIN_TEXT_COLOR,
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 2,
      border: `1px solid ${themeColors.BORDER_COLOR}`,
      transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
      "&:hover": {
        transform: "translateY(-5px)",
        boxShadow: `0 8px 16px ${
          themeColors.mode === "dark" ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.15)"
        }`,
      },
    }}
  >
    <Box sx={{ color: color, fontSize: 30, mr: 2 }}>{icon}</Box>
    <Box>
      <Typography variant="h5" fontWeight="bold">
        {value}
      </Typography>
      <Typography variant="subtitle2" color={themeColors.SECONDARY_TEXT_COLOR}>
        {title}
      </Typography>
    </Box>
  </Paper>
);

// Generic Chart Container - Dynamic Styles
const ChartContainer = ({
  title,
  totalValue,
  children,
  height = 400,
  showTotal = true,
  themeColors,
}) => (
  <Paper
    elevation={3}
    sx={{
      p: 3,
      // ✅ FIX: Use dynamic height for better responsiveness, especially for the 450px charts
      height: { xs: 400, md: height }, // Mobile par minimum 400px, MD par original height
      bgcolor: themeColors.CARD_BG_COLOR,
      color: themeColors.MAIN_TEXT_COLOR,
      borderRadius: 2,
      border: `1px solid ${themeColors.BORDER_COLOR}`,
      display: "flex",
      flexDirection: "column",
      transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
      "&:hover": {
        transform: "translateY(-5px)",
        boxShadow: `0 8px 16px ${
          themeColors.mode === "dark" ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.15)"
        }`,
      },
    }}
  >
    <Typography
      variant="h6"
      fontWeight="bold"
      sx={{
        mb: 2,
        borderBottom: `1px solid ${themeColors.BORDER_COLOR}`,
        pb: 1,
        color: themeColors.MAIN_TEXT_COLOR,
        // ✅ RESPONSIVE FIX: Smaller font on mobile
        fontSize: { xs: "1.1rem", md: "1.25rem" },
      }}
    >
      {title} {showTotal && `(Total: ${totalValue})`}
    </Typography>
    {/* Height adjustment to fit the remaining space */}
    <Box
      sx={{
        height: { xs: 400 - 65, md: height - 65 },
        flexGrow: 1,
        overflowY: "auto",
      }}
    >
      {children}
    </Box>
  </Paper>
);

// Recent Task Activity List - Added Flex-wrap for better mobile stacking
const RecentTaskActivity = ({ data, themeColors }) => {
  if (data.length === 0) {
    return (
      <Typography color={themeColors.SECONDARY_TEXT_COLOR} sx={{ p: 2 }}>
        No recent active tasks found.
      </Typography>
    );
  }

  return (
    <List sx={{ pt: 0, "& .MuiListItem-root": { py: 1.5 } }}>
      {data.map((task, index) => (
        <ListItem
          key={index}
          disableGutters
          sx={{
            borderBottom:
              index < data.length - 1
                ? `1px solid ${themeColors.BORDER_COLOR}`
                : "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            p: 1,
          }}
        >
          {/* Top Row: Title and Date */}
          <Box
            sx={{
              width: "100%",
              display: "flex",
              // ✅ FIX: Wrap content on mobile if title is too long
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 0.5,
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight="medium"
              // ✅ Allow wrapping on smaller screens if necessary
              noWrap={false}
              color={themeColors.MAIN_TEXT_COLOR}
              sx={{
                flexGrow: 1,
                mr: 1,
                // Ensure title doesn't overflow its line when wrapped
                width: { xs: "100%", sm: "auto" },
              }}
            >
              {task.title}
            </Typography>
            <Typography
              variant="caption"
              color={themeColors.SECONDARY_TEXT_COLOR}
              // ✅ Date should be pushed to the right on larger screens, new line on small
              sx={{ flexShrink: 0, mt: { xs: 0.5, sm: 0 } }}
            >
              {task.date}
            </Typography>
          </Box>

          {/* Bottom Row: Status Chip and Priority Chip */}
          <Box sx={{ width: "100%", display: "flex", gap: 1, mt: 0.5 }}>
            <Chip
              label={task.status}
              color={
                task.status === "Completed"
                  ? "success"
                  : task.status === "In Progress"
                  ? "warning"
                  : "error"
              }
              variant="outlined"
            />
            <Chip
              label={task.priority}
              color={
                task.priority === "High"
                  ? "error"
                  : task.priority === "Medium"
                  ? "warning"
                  : "info"
              }
              size="small"
            />
          </Box>
        </ListItem>
      ))}
    </List>
  );
};

// -----------------------------------------------------------
// 4. Dashboard Component (Refactored Layout)
// -----------------------------------------------------------

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const theme = useTheme();
  const themeColors = {
    ...getThemeColors(theme.palette.mode),
    mode: theme.palette.mode,
  };

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const data = await fetchTasks();
        const sanitizedData = data.map((task) => ({
          ...task,
          type: task.type || "Task",
          createdAt: task.createdAt || new Date().toISOString(),
        }));
        setTasks(sanitizedData);
      } catch (err) {
        console.error("Error fetching tasks for dashboard:", err);
        setError("Failed to load task data for the dashboard.");
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);

  const statusData = useMemo(() => getStatusSummary(tasks), [tasks]);
  const priorityData = useMemo(() => getPrioritySummary(tasks), [tasks]);
  const taskEventBreakdownData = useMemo(
    () => getTaskEventBreakdown(tasks),
    [tasks]
  );
  const monthlyData = useMemo(() => getMonthlyCompletionData(tasks), [tasks]);
  const recentActivityData = useMemo(() => getRecentActivity(tasks), [tasks]);

  const totalTasks = tasks.length;
  const completedTasks =
    statusData.find((d) => d.id === "Completed")?.value || 0;
  const progressTasks =
    statusData.find((d) => d.id === "In Progress")?.value || 0;

  const totalTasksEvents = totalTasks;
  const completionRate =
    totalTasksEvents > 0
      ? ((completedTasks / totalTasksEvents) * 100).toFixed(1)
      : 0;
  const highPriority = priorityData.find((d) => d.id === "High")?.value || 0;

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress sx={{ color: themeColors.MAIN_TEXT_COLOR }} />
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
    <Box
      sx={{
        p: { xs: 2, sm: 3 }, // ✅ RESPONSIVE: Smaller padding on mobile
        bgcolor: themeColors.BG_COLOR,
        minHeight: "100vh",
        color: themeColors.MAIN_TEXT_COLOR,
      }}
    >
      {/* HEADER SECTION */}
      <Box
        sx={{
          mb: 4,
          borderBottom: `1px solid ${themeColors.BORDER_COLOR}`,
          pb: 1,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          fontWeight="bold"
          color={themeColors.MAIN_TEXT_COLOR}
          // ✅ RESPONSIVE: Smaller font on mobile
          fontSize={{ xs: "1.5rem", sm: "2rem" }}
        >
          My Dashboard
        </Typography>
        <Typography variant="body1" color={themeColors.SECONDARY_TEXT_COLOR}>
          Hello, {user?.name || "User"}! Visualize your personal task flow.
        </Typography>
      </Box>

      {/* 1. TOP KPI CARDS (4 cards) - Uses responsive grid sizing */}
      <Grid container spacing={{ xs: 2, sm: 4 }} sx={{ mb: 4 }}>
        {" "}
        {/* ✅ Responsive spacing */}
        <Grid item xs={12} sm={6} md={3}>
          {" "}
          {/* ✅ xs=12, sm=6, md=3 for mobile, tablet, desktop */}
          <KPICard
            title="Total Tasks & Events"
            value={totalTasksEvents}
            icon={<TrendingUpIcon fontSize="inherit" />}
            color={theme.palette.info.main}
            themeColors={themeColors}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {" "}
          {/* ✅ xs=12, sm=6, md=3 */}
          <KPICard
            title={`Completed (${completionRate}%)`}
            value={completedTasks}
            icon={<CheckCircleOutlineIcon fontSize="inherit" />}
            color={theme.palette.success.main}
            themeColors={themeColors}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {" "}
          {/* ✅ xs=12, sm=6, md=3 */}
          <KPICard
            title="In Progress"
            value={progressTasks}
            icon={<HourglassEmptyIcon fontSize="inherit" />}
            color={theme.palette.warning.main}
            themeColors={themeColors}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {" "}
          {/* ✅ xs=12, sm=6, md=3 */}
          <KPICard
            title="High Priority"
            value={highPriority}
            icon={<WatchLaterIcon fontSize="inherit" />}
            color={theme.palette.error.main}
            themeColors={themeColors}
          />
        </Grid>
      </Grid>

      {/* 2. MIDDLE CHARTS ROW - Uses responsive grid sizing */}
      <Grid container spacing={{ xs: 2, sm: 4 }} sx={{ mb: 4 }}>
        {" "}
        {/* ✅ Responsive spacing */}
        {/* Chart 1: Monthly Completion Trend (Line Chart) */}
        <Grid item xs={12} md={6}>
          {" "}
          {/* ✅ xs=12, md=6: full width on mobile, half on desktop */}
          <ChartContainer
            title="Monthly Completion Trend"
            showTotal={false}
            height={450}
            themeColors={themeColors}
          >
            <ResponsiveLineChart data={monthlyData} themeColors={themeColors} />
          </ChartContainer>
        </Grid>
        {/* Chart 2: Recent Task Activity List */}
        <Grid item xs={12} md={6}>
          {" "}
          {/* ✅ xs=12, md=6: full width on mobile, half on desktop */}
          <ChartContainer
            title="Recent Task Activity"
            showTotal={false}
            height={450}
            themeColors={themeColors}
          >
            <RecentTaskActivity
              data={recentActivityData}
              themeColors={themeColors}
            />
          </ChartContainer>
        </Grid>
      </Grid>

      {/* 3. BOTTOM CHARTS ROW - Uses responsive grid sizing */}
      <Grid container spacing={{ xs: 2, sm: 4 }}>
        {" "}
        {/* ✅ Responsive spacing */}
        {/* Chart 3: Task Completion Status (Pie Chart) */}
        <Grid item xs={12} md={4}>
          {" "}
          {/* ✅ xs=12, md=4: full width on mobile, third on desktop */}
          <ChartContainer
            title="Task Completion Status"
            totalValue={totalTasksEvents}
            height={400}
            themeColors={themeColors}
          >
            <ResponsivePieChart
              data={statusData}
              subtitle="Completion"
              themeColors={themeColors}
            />
          </ChartContainer>
        </Grid>
        {/* Chart 4: Task Priority Level (Simple Bar Chart) */}
        <Grid item xs={12} md={4}>
          {" "}
          {/* ✅ xs=12, md=4: full width on mobile, third on desktop */}
          <ChartContainer
            title="Task Priority Level"
            totalValue={totalTasksEvents}
            height={400}
            themeColors={themeColors}
          >
            <ResponsiveSimpleBarChart
              data={priorityData}
              themeColors={themeColors}
            />
          </ChartContainer>
        </Grid>
        {/* Chart 5: Task & Event Progress by Type (Stacked Bar Chart) */}
        <Grid item xs={12} md={4}>
          {" "}
          {/* ✅ xs=12, md=4: full width on mobile, third on desktop */}
          <ChartContainer
            title="Task & Event Progress by Type"
            totalValue={totalTasksEvents}
            height={400}
            themeColors={themeColors}
          >
            <ResponsiveStackedBarChart
              data={taskEventBreakdownData}
              keys={["Completed", "In Progress", "Pending"]}
              indexBy="type"
              themeColors={themeColors}
            />
          </ChartContainer>
        </Grid>
      </Grid>
    </Box>
  );
}
