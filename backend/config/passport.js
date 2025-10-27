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
          // New user creation
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
          // Only update if current profilePic is NOT a custom upload
          if (
            picUrl &&
            (user.profilePic === undefined ||
             user.profilePic === "" ||
             !user.profilePic.includes("/uploads/"))
          ) {
            user.profilePic = picUrl;
            needsSave = true;
          }

          // Update authProvider and googleId if missing
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

        // ✅ Passport session
        // Pass only minimal info to session for security
        const sessionUser = {
          _id: user._id,
          name: user.name,
          email: user.email,
          profilePic: user.profilePic,
          authProvider: user.authProvider,
        };

        done(null, sessionUser);

      } catch (err) {
        console.error("Google Auth Error:", err);
        done(err, null);
      }
    }
  )
);

// Passport serialize/deserialize
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

export default passport;
