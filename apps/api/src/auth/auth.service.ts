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

  private excludePassword(user: any) {
    const { hashedPassword, ...result } = user;
    return result;
  }
}