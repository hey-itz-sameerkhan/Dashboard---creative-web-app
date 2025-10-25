// backend/config/passport.js

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) throw new Error("Google profile has no email");

        let user = await User.findOne({ email });

        // --- Profile Picture Handling ---
        let picUrl = profile.photos?.[0]?.value || "";
        const BROKEN_URL_PATTERN = "googleusercontent.com/profile/picture/";

        if (picUrl.includes(BROKEN_URL_PATTERN)) {
          picUrl = ""; 
        } else if (picUrl && !picUrl.startsWith("https://")) {
          picUrl = picUrl.replace("http://", "https://");
        }

        if (!user) {
          // New user creation (Use Google pic by default)
          user = await User.create({
            name: profile.displayName || "No Name",
            email,
            googleId: profile.id,
            authProvider: "google",
            profilePic: picUrl,
          });
        } else {
          // Update existing user if needed
          let needsSave = false;

          // ✅ FIX: ProfilePic Overwrite Prevention
          // 1. Check if Google provided a picUrl.
          // 2. ONLY update if the existing pic is NOT a custom upload (by checking for '/uploads/')
          //    यानी, अगर current pic गूगल की ही पुरानी URL है, तो ही अपडेट करो।
          if (
              picUrl && // Google provided a new URL
              (user.profilePic === undefined || 
               user.profilePic === '' ||
               !user.profilePic.includes('/uploads/')) // Current pic is NOT a custom upload
          ) {
            user.profilePic = picUrl;
            needsSave = true;
          }
          // End of FIX

          if (user.authProvider !== "google") {
            user.authProvider = "google";
            needsSave = true;
          }
          if (!user.googleId) {
            user.googleId = profile.id;
            needsSave = true;
          }

          if (needsSave) await user.save();
        }

        // Passport requires the Mongoose user object to set up the session (req.user)
        done(null, user); 
        
      } catch (err) {
        console.error("Google Auth Error:", err);
        done(err, null);
      }
    }
  )
);

// Passport serialize/deserialize
// We now pass the user object directly, which is correct for session-based auth.
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

export default passport;