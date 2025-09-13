import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/services/prisma.service';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import { User } from '@wine-marketplace/shared';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<any> {
    const { email, password, username, firstName, lastName } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('Email already in use');
      }
      if (existingUser.username === username) {
        throw new ConflictException('Username already in use');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        firstName,
        lastName,
        hashedPassword,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: this.excludePassword(user),
      ...tokens,
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.hashedPassword) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
    
    if (!isPasswordValid) {
      return null;
    }

    return this.excludePassword(user);
  }

  async login(user: any): Promise<any> {
    const tokens = await this.generateTokens(user);
    
    return {
      user,
      ...tokens,
    };
  }

  async validateGoogleUser(googleUser: any): Promise<any> {
    const { email, firstName, lastName, picture, googleId } = googleUser;

    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create new user from Google profile
      const username = await this.generateUniqueUsername(firstName, lastName);
      
      user = await this.prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          avatar: picture,
          googleId,
          username,
          verified: true,
          profileComplete: true,
        },
      });
    } else if (!user.googleId) {
      // Link Google account to existing user
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          googleId,
          verified: true,
        },
      });
    }

    return this.excludePassword(user);
  }

  private async generateTokens(user: any): Promise<any> {
    const payload = { 
      sub: user.id, 
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };
  }

  private async generateUniqueUsername(firstName?: string, lastName?: string): Promise<string> {
    const base = firstName || lastName || 'user';
    const baseUsername = base.toLowerCase().replace(/[^a-z0-9]/g, '');
    let username = baseUsername;
    let counter = 1;

    while (true) {
      const existingUser = await this.prisma.user.findUnique({
        where: { username },
      });

      if (!existingUser) {
        return username;
      }

      username = `${baseUsername}${counter}`;
      counter++;
    }
  }

  async refreshToken(refreshToken: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.banned) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user);
      return {
        user: this.excludePassword(user),
        ...tokens,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(email: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not
      return { message: 'If this email exists, a password reset link has been sent' };
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = this.jwtService.sign(
      { sub: user.id, type: 'password-reset' },
      { expiresIn: '1h' }
    );

    // TODO: Send email with reset token
    // For now, just return the token (in production, this would be sent via email)
    return { 
      message: 'If this email exists, a password reset link has been sent',
      resetToken // Remove this in production
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);
      
      if (payload.type !== 'password-reset') {
        throw new UnauthorizedException('Invalid reset token');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid reset token');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await this.prisma.user.update({
        where: { id: user.id },
        data: { hashedPassword },
      });

      return { message: 'Password reset successful' };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }

  private excludePassword(user: any) {
    const { hashedPassword, ...result } = user;
    return result;
  }
}