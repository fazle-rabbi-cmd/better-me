import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service.js';
import { RegisterDto, LoginDto } from './dto/auth.dto.js';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    // Hash password securely using Argon2
    const passwordHash = await argon2.hash(dto.password);

    // Create user and default profile inside a transaction
    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
        },
      });

      await tx.profile.create({
        data: {
          userId: newUser.id,
          firstName: dto.firstName || null,
          lastName: dto.lastName || null,
        },
      });

      return newUser;
    });

    return {
      success: true,
      message: 'User registered successfully',
      data: { userId: user.id, email: user.email },
    };
  }

  async login(dto: LoginDto, userAgent?: string, ipAddress?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password with Argon2
    const passwordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Save refresh token session in database
    await this.saveSession(user.id, tokens.refreshToken, userAgent, ipAddress);

    return tokens;
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const session = await this.prisma.session.findUnique({
        where: { refreshToken },
      });

      if (!session || session.expiresAt < new Date()) {
        throw new UnauthorizedException('Session expired or invalid');
      }

      // Delete old session (Token Rotation)
      await this.prisma.session.delete({ where: { id: session.id } });

      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Issue new token pair
      const tokens = await this.generateTokens(user.id, user.email, user.role);
      await this.saveSession(user.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string) {
    await this.prisma.session.deleteMany({
      where: { refreshToken },
    });
    return { success: true, message: 'Logged out successfully' };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: (this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m') as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d') as any,
    });

    return { accessToken, refreshToken };
  }

  private async saveSession(userId: string, refreshToken: string, userAgent?: string, ipAddress?: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    await this.prisma.session.create({
      data: {
        userId,
        refreshToken,
        userAgent: userAgent || 'Unknown',
        ipAddress: ipAddress || 'Unknown',
        expiresAt,
      },
    });
  }
}