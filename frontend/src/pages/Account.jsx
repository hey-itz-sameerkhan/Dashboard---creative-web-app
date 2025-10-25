import { LockOpen, Person, PhotoCamera, Save } from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Input,
  Modal,
  Paper,
  Slider,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { updateProfile, updateProfilePicture } from "../utils/api.js";
import { getFullImageUrl } from "../utils/image.js";

// =============================================
// Image Cropper Utility
// =============================================
const getCroppedImage = (imageSrc, pixelCrop) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Failed to crop."))),
        "image/jpeg",
        0.95
      );
    };
    image.onerror = (e) => reject(e);
    image.src = imageSrc;
  });

// =============================================
// Cropper Modal
// =============================================
function ImageCropperModal({ imageSrc, onCropComplete, onModalClose }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleSave = async () => {
    if (!croppedAreaPixels) return onModalClose();
    try {
      const croppedBlob = await getCroppedImage(imageSrc, croppedAreaPixels);
      onCropComplete(croppedBlob);
    } catch (err) {
      console.error(err);
      onModalClose();
    }
  };

  return (
    <Modal open onClose={onModalClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "95%", sm: "90%", md: 600 },
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 3,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" mb={2}>
          Crop & Adjust Profile Picture
        </Typography>
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: { xs: 250, sm: 300, md: 350 },
            background: "#333",
            borderRadius: 2,
            mb: 2,
          }}
        >
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(a, b) => setCroppedAreaPixels(b)}
            cropShape="round"
            objectFit="contain"
          />
        </Box>
        <Typography variant="subtitle2" gutterBottom>
          Zoom:
        </Typography>
        <Slider
          value={zoom}
          min={1}
          max={3}
          step={0.1}
          onChange={(e, val) => setZoom(val)}
          color="primary"
          sx={{ mb: 2 }}
        />
        <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={1}>
          <Button onClick={onModalClose} variant="outlined" fullWidth>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            startIcon={<Save />}
            variant="contained"
            fullWidth
          >
            Crop & Save
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

// =============================================
// Profile Picture Section
// =============================================
function ProfilePictureUploader({ user, refreshUser }) {
  const [loading, setLoading] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    getFullImageUrl(user?.profilePic)
  );
  const { showToast } = useToast();

  useEffect(() => {
    setPreviewUrl(getFullImageUrl(user?.profilePic));
  }, [user?.profilePic]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImageToCrop(reader.result);
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const handleCropComplete = async (blob) => {
    setImageToCrop(null);
    setLoading(true);
    showToast("Uploading profile picture...", "info");
    try {
      const formData = new FormData();
      formData.append("profilePic", blob, "profile.jpg");
      const data = await updateProfilePicture(formData);
      showToast(data.message || "Profile picture updated!", "success");
      refreshUser();
    } catch (err) {
      showToast(err.message || "Upload failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      elevation={4}
      sx={{
        p: { xs: 2, sm: 3 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography variant="h6" gutterBottom>
        Profile Picture
      </Typography>
      <Avatar
        src={previewUrl}
        alt={user?.name || "User"}
        sx={{
          width: { xs: 90, sm: 120 },
          height: { xs: 90, sm: 120 },
          mb: 2,
          border: "3px solid",
          borderColor: "primary.main",
        }}
      >
        <Person sx={{ fontSize: 50 }} />
      </Avatar>

      <Input
        accept="image/*"
        id="upload-file"
        type="file"
        sx={{ display: "none" }}
        onChange={handleFileChange}
      />
      <label htmlFor="upload-file" style={{ width: "100%" }}>
        <Button
          fullWidth
          variant="outlined"
          component="span"
          startIcon={<PhotoCamera />}
          disabled={loading}
        >
          {loading ? "Uploading..." : "Change / Adjust Photo"}
        </Button>
      </label>
      {imageToCrop && (
        <ImageCropperModal
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          onModalClose={() => setImageToCrop(null)}
        />
      )}
    </Paper>
  );
}

// =============================================
// Profile Update Form
// =============================================
function ProfileUpdateForm({ user, refreshUser }) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    address: user?.address || "",
    contact: user?.contact || "",
    city: user?.city || "",
    state: user?.state || "",
    pinCode: user?.pinCode || "",
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const isGoogleUser = user?.authProvider === "google";

  useEffect(() => {
    setFormData({
      name: user?.name || "",
      address: user?.address || "",
      contact: user?.contact || "",
      city: user?.city || "",
      state: user?.state || "",
      pinCode: user?.pinCode || "",
    });
  }, [user]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    showToast("Saving changes...", "info");
    try {
      const data = await updateProfile(formData);
      showToast(data.message || "Profile updated!", "success");
      refreshUser();
    } catch (err) {
      showToast(err.message || "Failed to update profile.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={4} sx={{ p: { xs: 2, sm: 4 } }}>
      <Typography variant="h5" gutterBottom>
        Personal Information
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {isGoogleUser && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You are logged in with Google. Name cannot be changed.
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading || isGoogleUser}
              InputProps={{ readOnly: isGoogleUser }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              value={user?.email || "N/A"}
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Contact Number"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Pin Code"
              name="pinCode"
              value={formData.pinCode}
              onChange={handleChange}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Full Address"
              name="address"
              multiline
              rows={2}
              value={formData.address}
              onChange={handleChange}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="State/UT"
              name="state"
              value={formData.state}
              onChange={handleChange}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} textAlign="right">
            <Button
              type="submit"
              variant="contained"
              startIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Save />
                )
              }
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
}

// =============================================
// Main Account Page
// =============================================
export default function Account() {
  const { user, refreshUser, isLoading } = useAuth();
  const isGoogleUser = user?.authProvider === "google";

  if (isLoading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  if (!user) return null;

  return (
    <Box sx={{ mt: 3, p: { xs: 1, sm: 2, md: 3 } }}>
      <Typography
        variant="h4"
        sx={{
          mb: 1,
          fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.5rem" },
          textAlign: { xs: "center", md: "left" },
        }}
      >
        My Account
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          mb: 3,
          textAlign: { xs: "center", md: "left" },
          px: { xs: 1, md: 0 },
        }}
      >
        Manage your personal profile information and security settings.
      </Typography>

      <Grid
        container
        spacing={3}
        sx={{
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        <Grid item xs={12} md={4}>
          <ProfilePictureUploader user={user} refreshUser={refreshUser} />
        </Grid>
        <Grid item xs={12} md={8}>
          <ProfileUpdateForm user={user} refreshUser={refreshUser} />
          <Paper
            elevation={4}
            sx={{ p: { xs: 2, sm: 3, md: 4 }, mt: { xs: 3, md: 4 } }}
          >
            <Typography variant="h5" gutterBottom>
              Security Settings
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Alert severity="info" sx={{ mb: 2 }}>
              Password change is disabled for this account.
            </Alert>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<LockOpen />}
              disabled={isGoogleUser}
            >
              Change Password
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
