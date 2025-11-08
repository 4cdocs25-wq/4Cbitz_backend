import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail } from '../models/queries.js';
import logger from '../utils/logger.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthService {
  // Verify Google ID token
  static async verifyGoogleToken(idToken) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();

      return {
        email: payload.email,
        name: payload.name,
        googleId: payload.sub,
        picture: payload.picture,
        emailVerified: payload.email_verified
      };
    } catch (error) {
      logger.error('Google token verification error:', error);
      throw new Error('Invalid Google token');
    }
  }

  // Generate access token
  static generateAccessToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  // Generate refresh token
  static generateRefreshToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    );
  }

  // Verify refresh token
  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  // Google OAuth login/register
  static async googleAuth(googleIdToken) {
    try {
      // Verify Google token
      const googleUser = await this.verifyGoogleToken(googleIdToken);

      if (!googleUser.emailVerified) {
        throw new Error('Email not verified with Google');
      }

      // Check if user exists
      let user = await findUserByEmail(googleUser.email);

      if (!user) {
        // Create new user (default role: user)
        user = await createUser(
          googleUser.email,
          googleUser.name,
          'user',
          googleUser.googleId,
          googleUser.picture
        );

        logger.info(`New user created via Google OAuth: ${user.email}`);
      } else {
        logger.info(`Existing user logged in via Google OAuth: ${user.email}`);
      }

      // Generate tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          picture: user.picture
        },
        accessToken,
        refreshToken
      };
    } catch (error) {
      logger.error('Google auth error:', error);
      throw error;
    }
  }

  // Refresh access token
  static async refreshAccessToken(refreshToken) {
    try {
      const decoded = this.verifyRefreshToken(refreshToken);
      const user = await findUserByEmail(decoded.email);

      if (!user) {
        throw new Error('User not found');
      }

      const newAccessToken = this.generateAccessToken(user);

      return { accessToken: newAccessToken };
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw error;
    }
  }
}

export default AuthService;
