// backend/utils/generateToken.js — FINAL CLEAN VERSION

import jwt from "jsonwebtoken";

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId }, // ✅ consistent payload
    process.env.JWT_SECRET,
    {
      expiresIn: "7d", // ✅ longer session (better UX)
    }
  );
};

export default generateToken;