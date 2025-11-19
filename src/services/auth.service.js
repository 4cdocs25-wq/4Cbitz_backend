import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail, findUserById } from '../models/queries.js';
import logger from '../utils/logger.js';
import EmailService from './email.service.js';

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

        // Send welcome email (don't await to avoid blocking registration)
        EmailService.sendWelcomeEmail(user.email, user.name)
          .catch(error => logger.error('Failed to send welcome email:', error));
      } else {
        logger.info(`Existing user logged in via Google OAuth: ${user.email}`);
      }

      // Generate tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Get complete user data with all fields including profile_completed
      const completeUser = await findUserById(user.id);

      return {
        user: completeUser,
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

  // Hash password using bcrypt
  static async hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  // Verify password against hash
  static async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  // Admin email/password login
  static async adminEmailLogin(email, password) {
    try {
      // Find user by email
      const user = await findUserByEmail(email);

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if user is admin
      if (user.role !== 'admin') {
        throw new Error('Invalid email or password');
      }

      // Check if user has password set
      if (!user.password_hash) {
        throw new Error('Password not set for this account. Please use Google login or set a password first.');
      }

      // Verify password
      const isPasswordValid = await this.verifyPassword(password, user.password_hash);

      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Generate tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      logger.info(`Admin logged in via email/password: ${user.email}`);

      return {
        user,
        accessToken,
        refreshToken
      };
    } catch (error) {
      logger.error('Admin email login error:', error.message);
      throw error;
    }
  }

  // Set admin password (for initial setup or password change)
  static async setAdminPassword(userId, password, currentPassword = null) {
    try {
      // Import updateUserPassword dynamically to avoid circular dependency
      const { updateUserPassword } = await import('../models/queries.js');

      // Get current user to check if password is already set
      const user = await findUserById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      // If user already has a password, verify current password
      if (user.password_hash) {
        if (!currentPassword) {
          throw new Error('Current password is required');
        }

        const isCurrentPasswordValid = await this.verifyPassword(currentPassword, user.password_hash);

        if (!isCurrentPasswordValid) {
          throw new Error('Current password is incorrect');
        }
      }

      // Hash new password
      const passwordHash = await this.hashPassword(password);

      // Update user password and auth method
      await updateUserPassword(userId, passwordHash);

      logger.info(`Password set for user ID: ${userId}`);

      return { success: true };
    } catch (error) {
      logger.error('Set admin password error:', error);
      throw error;
    }
  }
}

export default AuthService;
