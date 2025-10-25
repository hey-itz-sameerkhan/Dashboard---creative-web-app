// frontend/src/pages/AdminDashboard.jsx (MOBILE RESPONSIVE & Dark Mode FIXES)

import {
  AdminPanelSettings,
  Group,
  HourglassEmpty,
  Task,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Paper,
  Typography,
  useTheme, // ✅ IMPORTED: Use theme for dynamic colors
} from "@mui/material";
import { ResponsiveLine } from "@nivo/line";
import { ResponsivePie } from "@nivo/pie";
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_URL, getToken } from "../utils/api";

// -------------------- Data Fetching (UNCHANGED) --------------------
const fetchAdminDashboardData = async (token) => {
  const response = await fetch(`${API_URL}/api/admin/dashboard-stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok)
    throw new Error("Failed to fetch admin stats or Unauthorized.");
  return await response.json();
};

// -------------------- Data Processing (UNCHANGED) --------------------
const getStatusPieData = (tasks) => {
  const counts = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});
  return [
    {
      id: "done",
      label: "Completed",
      value: counts.done || 0,
      color: "#4caf50",
    },
    {
      id: "pending",
      label: "Pending",
      value: counts.pending || 0,
      color: "#ff9800",
    },
  ];
};

const getTasksLineData = (tasks) => {
  if (!tasks || tasks.length === 0) return [];
  const counts = {};
  tasks.forEach((task) => {
    if (!task.createdAt) return;
    const dateObj = new Date(task.createdAt);
    if (isNaN(dateObj)) return;
    const date = dateObj.toISOString().split("T")[0];
    counts[date] = (counts[date] || 0) + 1;
  });
  const sortedDates = Object.keys(counts).sort();
  const dataPoints = sortedDates.map((date) => ({ x: date, y: counts[date] }));
  return [{ id: "Tasks Created", color: "#1976d2", data: dataPoints }];
};

// -------------------- Main Component (FIXED for Responsiveness) --------------------
export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isAdmin = user?.role === "admin";
  const token = getToken();

  // ✅ Use Theme for Dark Mode and Responsiveness
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const dynamicColors = {
    PRIMARY_TEXT: theme.palette.text.primary,
    SECONDARY_TEXT: theme.palette.text.secondary,
  };

  // ✅ Nivo Theme Configuration for Dark Mode Text Visibility (UNCHANGED)
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
    if (!isAdmin || !token) {
      setLoading(false);
      return;
    }
    const loadData = async () => {
      try {
        setError(null);
        setLoading(true);
        const data = await fetchAdminDashboardData(token);
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [isAdmin, token]);

  const taskStatusData = useMemo(
    () => (stats ? getStatusPieData(stats.allTasks) : []),
    [stats]
  );
  const lineChartData = useMemo(
    () => (stats ? getTasksLineData(stats.allTasks) : []),
    [stats]
  );

  const summaryCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: <Group />,
      color: "#3f51b5",
      path: "/admin/users",
    },
    {
      title: "Total Tasks",
      value: stats?.totalTasks || 0,
      icon: <Task />,
      color: "#1976d2",
      path: "/tasks",
    },
    {
      title: "Pending Tasks",
      value: taskStatusData.find((d) => d.id === "pending")?.value || 0,
      icon: <HourglassEmpty />,
      color: "#ff9800",
    },
  ];

  if (isLoading || loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  if (!isAdmin)
    return (
      <Alert severity="error" sx={{ mt: 3 }}>
        Access Denied. You are not authorized to view the Admin Dashboard.
      </Alert>
    );

  return (
    <Box sx={{ mt: 3, p: { xs: 1, sm: 2 } }}>
      {" "}
      {/* ✅ RESPONSIVE: Less padding on small screens */}
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        color={dynamicColors.PRIMARY_TEXT}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          // ✅ RESPONSIVE: Smaller heading on mobile
          fontSize: { xs: "2rem", sm: "3rem" },
        }}
      >
        <AdminPanelSettings color="error" /> Admin Control Panel
      </Typography>
      <Typography
        variant="body1"
        color={dynamicColors.SECONDARY_TEXT}
        sx={{ mb: 4 }}
      >
        System-wide overview and key metrics for all users and tasks.
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {/* -------------------- Summary Cards -------------------- */}
      {/* Grid already handles responsiveness with xs=12, sm=6, md=4 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {summaryCards.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              elevation={6}
              component={item.path ? Link : "div"}
              to={item.path}
              sx={{
                height: "100%",
                borderLeft: `5px solid ${item.color}`,
                textDecoration: "none",
                transition: "0.3s",
                "&:hover": { boxShadow: 10, transform: "translateY(-2px)" },
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <Typography
                    variant="h4"
                    color={item.color}
                    sx={{ fontWeight: "bold" }}
                  >
                    {item.value}
                  </Typography>
                  <Typography color={dynamicColors.SECONDARY_TEXT}>
                    {item.title}
                  </Typography>
                </div>
                <Box sx={{ color: item.color, opacity: 0.7 }}>
                  {React.cloneElement(item.icon, { sx: { fontSize: 50 } })}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {/* -------------------- Charts Container -------------------- */}
      <Paper
        elevation={4}
        sx={{
          p: { xs: 1, sm: 2 }, // ✅ RESPONSIVE: Less padding on small screens
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        {/* Pie Chart */}
        <Box
          sx={{
            flex: { xs: "1 1 100%", md: "1 1 45%" }, // ✅ RESPONSIVE: Small screen takes full width (100%), large screen takes less than half (45%)
            minHeight: 350,
          }}
        >
          <Typography
            variant="h6"
            sx={{ mb: 1 }}
            color={dynamicColors.PRIMARY_TEXT}
          >
            Global Task Status Distribution
          </Typography>
          {stats?.totalTasks > 0 ? (
            <Box sx={{ height: 300 }}>
              {" "}
              {/* Set fixed height for chart */}
              <ResponsivePie
                data={taskStatusData}
                theme={NIVO_THEME}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                innerRadius={0.6}
                padAngle={0.7}
                cornerRadius={3}
                colors={{ datum: "data.color" }}
                arcLinkLabelsTextColor={
                  isDark ? dynamicColors.PRIMARY_TEXT : "#333"
                }
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: "color" }}
                arcLabelsTextColor={{
                  from: "color",
                  modifiers: [["darker", 2]],
                }}
                animate={true}
              />
            </Box>
          ) : (
            <Typography variant="body2" color="text.disabled">
              No tasks available
            </Typography>
          )}
        </Box>

        {/* Line Chart */}
        <Box
          sx={{
            flex: { xs: "1 1 100%", md: "1 1 45%" }, // ✅ RESPONSIVE: Small screen takes full width (100%), large screen takes less than half (45%)
            minHeight: 350,
          }}
        >
          <Typography
            variant="h6"
            sx={{ mb: 1 }}
            color={dynamicColors.PRIMARY_TEXT}
          >
            Tasks Over Time
          </Typography>
          {lineChartData[0]?.data.length > 0 ? (
            <Box sx={{ height: 300 }}>
              {" "}
              {/* Set fixed height for chart */}
              <ResponsiveLine
                data={lineChartData}
                theme={NIVO_THEME}
                margin={{ top: 20, right: 30, bottom: 60, left: 60 }}
                xScale={{ type: "point" }}
                yScale={{ type: "linear", min: 0 }}
                axisBottom={{
                  orient: "bottom",
                  tickRotation: -45,
                  legend: "Date",
                  legendOffset: 45,
                }}
                axisLeft={{
                  orient: "left",
                  legend: "Tasks",
                  legendOffset: -50,
                }}
                colors={{ scheme: "category10" }}
                pointSize={8}
                pointBorderWidth={2}
                pointLabelYOffset={-12}
                useMesh={true}
                enableSlices="x"
              />
            </Box>
          ) : (
            <Typography variant="body2" color="text.disabled">
              No task creation data available
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
