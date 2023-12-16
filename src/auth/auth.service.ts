import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, genSalt, hash } from 'bcryptjs';
import { PrismaService } from 'src/prisma.service';
import { AuthDto } from './dto/auth.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refreshToken.dto';

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private readonly jwtService: JwtService
	) {}

	async register(dto: AuthDto) {
		const user = await this.prisma.user.findFirst({
			where: {
				email: dto.email,
			},
		});
		if (user) throw new NotFoundException('User register');

		const salt = await genSalt(10);
		const pass = await hash(dto.password, salt);

		const newUser = this.prisma.user.create({
			data: {
				email: dto.email,
				password: pass,
				firstName: dto.firstName,
				lastName: dto.lastName,
				image: dto.image,
				pdf: dto.pdf,
			},
		});

		const tokens = await this.issueTokenPair((await newUser).email);

		return {
			user: dto,
			...tokens,
		};
	}

	async login(dto: LoginDto) {
		const user = this.validateUser(dto);
		if (!user) throw new UnauthorizedException('User not found');

		const tokens = await this.issueTokenPair((await user).email);

		return {
			user: dto,
			...tokens,
		};
	}

	async getNewTokens({ refreshToken }: RefreshTokenDto) {
		if (!refreshToken) throw new UnauthorizedException('Please sign in!');

		const result = await this.jwtService.verifyAsync(refreshToken);
		if (!result) throw new UnauthorizedException('Invalid token of expired!');

		const user = await this.prisma.user.findFirst({
			where: {
				email: result.email,
			},
		});
		if (!user) throw new UnauthorizedException('User not found');

		const tokens = await this.issueTokenPair((await user).email);

		return {
			user: user,
			...tokens,
		};
	}

	async validateUser(dto: LoginDto) {
		const user = await this.prisma.user.findFirst({
			where: {
				email: dto.email,
			},
		});
		if (!user) throw new UnauthorizedException('User not found');

		const isVadidPassword = await compare(dto.password, user.password);
		if (!isVadidPassword) throw new UnauthorizedException('Invalid password');
		return user;
	}

	async issueTokenPair(userEmail: string) {
		const data = { _email: userEmail };

		const refreshToken = await this.jwtService.signAsync(data, {
			expiresIn: '15d',
		});

		const accessToken = await this.jwtService.signAsync(data, {
			expiresIn: '1min',
		});

		return { accessToken, refreshToken };
	}
}
