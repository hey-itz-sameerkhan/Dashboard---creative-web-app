// frontend/src/pages/Home.jsx (FIXED for Dark Mode White Backgrounds)

import { CheckCircle, HourglassEmpty, Task } from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTasks } from "../context/TaskContext.jsx";

const LazyThreeScene = lazy(() => import("../components/ThreeScene.jsx"));

export default function Home() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { tasks, isLoading: isTasksLoading } = useTasks();
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const welcomeColor =
    theme.palette.mode === "dark"
      ? theme.palette.primary.light
      : theme.palette.primary.dark;

  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(
    (t) => t.status === "Pending" || t.status === "In Progress"
  ).length;
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;

  const dynamicTaskSummary = [
    {
      title: "Total Tasks",
      value: totalTasks,
      icon: <Task />,
      color: theme.palette.info.main,
    },
    {
      title: "Pending",
      value: pendingTasks,
      icon: <HourglassEmpty />,
      color: theme.palette.warning.main,
    },
    {
      title: "Completed",
      value: completedTasks,
      icon: <CheckCircle />,
      color: theme.palette.success.main,
    },
  ];

  if (isAuthLoading || isTasksLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2, md: 3 },
        pb: 6,
        overflowX: "hidden",
        minHeight: "100vh",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* 🟦 Welcome Section */}
      <Paper
        elevation={4}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          mb: { xs: 3, sm: 4 },
          borderLeft: `5px solid ${theme.palette.primary.main}`,
          backgroundColor: theme.palette.background.paper,
          borderRadius: 3,
          textAlign: "center",
        }}
      >
        <Typography
          variant={isMobile ? "h6" : "h3"}
          fontWeight={700}
          sx={{
            color: welcomeColor,
            textShadow: `0 0 5px ${welcomeColor}50`,
            wordBreak: "break-word",
          }}
        >
          Welcome, {user?.name || "User"}!
        </Typography>

        <Typography
          variant={isMobile ? "body2" : "h6"}
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          Your <b>command center</b> is ready. Let's dominate the day in style!
        </Typography>

        <Typography
          onClick={() => navigate("/dashboard")}
          sx={{
            mt: 1,
            fontWeight: "bold",
            color: theme.palette.success.main,
            cursor: "pointer",
            "&:hover": { textDecoration: "underline" },
            fontSize: { xs: "0.85rem", sm: "1rem" },
          }}
        >
          Go to Dashboard →
        </Typography>
      </Paper>

      {/* 🟩 Avatar Section */}
      <Paper
        elevation={5}
        sx={{
          mb: { xs: 3, sm: 4 },
          height: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 3,
          backgroundColor: theme.palette.background.paper,
          overflow: "hidden",
          p: { xs: 1.5, sm: 2 },
        }}
      >
        <Suspense fallback={<CircularProgress color="primary" />}>
          <Box
            sx={{
              width: "100%",
              maxWidth: 400,
              height: { xs: 220, sm: 350, md: 450 },
              mx: "auto",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              transform: isMobile ? "scale(0.95)" : "scale(1)",
              transition: "transform 0.3s ease",
            }}
          >
            <LazyThreeScene />
          </Box>
        </Suspense>
      </Paper>

      <Divider sx={{ my: { xs: 2, sm: 3 } }} />

      {/* 🟨 Quick Overview Section */}
      <Typography
        variant={isMobile ? "h6" : "h4"}
        sx={{ mb: { xs: 2, sm: 3 }, fontWeight: 600, textAlign: "center" }}
      >
        Quick Overview
      </Typography>

      <Grid
        container
        spacing={2}
        justifyContent="center"
        alignItems="stretch"
        sx={{
          mx: "auto",
          width: "100%",
          maxWidth: 500,
        }}
      >
        {dynamicTaskSummary.map((item, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Card
              elevation={5}
              sx={{
                borderRadius: 3,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: `0 8px 16px ${
                    theme.palette.mode === "dark"
                      ? "rgba(0,0,0,0.5)"
                      : "rgba(0,0,0,0.15)"
                  }`,
                },
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  p: { xs: 2, sm: 2.5 },
                  gap: 1,
                  textAlign: "center",
                }}
              >
                <Box
                  sx={{
                    color: item.color,
                    bgcolor: `${item.color}20`,
                    p: { xs: 1, sm: 1.5 },
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {React.cloneElement(item.icon, {
                    sx: { fontSize: { xs: 28, sm: 36 } },
                  })}
                </Box>
                <Typography
                  variant={isMobile ? "h6" : "h5"}
                  fontWeight={700}
                  color="text.primary"
                >
                  {item.value}
                </Typography>
                <Typography
                  variant={isMobile ? "body2" : "subtitle1"}
                  color="text.secondary"
                >
                  {item.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
