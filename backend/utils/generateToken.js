// backend/utils/generateToken.js (100% FIXED for Consistency)
import jwt from 'jsonwebtoken';

/**
 * Generates a JWT token and optionally sets it as an HTTP-only cookie.
 * @param {object} res - Express response object (optional).
 * @param {string} userId - ID of the user to encode in the token.
 * @param {boolean} returnStringOnly - If true, prevents setting the cookie and only returns the token string.
 * @returns {string} The generated JWT token string.
 */
const generateToken = (res, userId, returnStringOnly = false) => {
    // 🎯 FIX: Use 'id' key in the JWT payload for consistent authentication
    // across Manual and Google Login (as inferred from your Handover Doc).
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '1d',
    });

    if (returnStringOnly || !res) {
        return token;
    }
    
    // Set JWT as HTTP-only cookie
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        maxAge: 24 * 60 * 60 * 1000,
    });

    return token;
};

export default generateToken;
