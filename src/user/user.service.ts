import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserDto } from './user.dto';

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	async getAll() {
		return this.prisma.user.findMany();
	}

	async getOne(dto: UserDto) {
		const user = await this.prisma.user.findFirst({
			where: {
				email: dto.email,
			},
		});
		if (!user) throw new NotFoundException('User not found');
		return user;
	}

	async create(dto: UserDto) {
		const user = await this.getOne(dto);
		if (user) throw new NotFoundException('User exists!');

		return this.prisma.user.create({
			data: dto,
		});
	}

	async update(dto: UserDto) {
		const user = await this.getOne(dto);
		if (!user) throw new NotFoundException('User not found');

		return this.prisma.user.update({
			where: {
				email: user.email,
			},
			data: {
				firstName: dto.firstName,
				lastName: dto.lastName,
				image: dto.image,
				pdf: dto.pdf,
			},
		});
	}

	async delete(dto: UserDto) {
		const user = await this.getOne(dto);
		if (!user) throw new NotFoundException('User not found');

		return this.prisma.user.delete({
			where: {
				email: user.email,
			},
		});
	}

	async byEmail(email: string) {
		const user = await this.prisma.user.findFirst({
			where: {
				email,
			},
		});
		if (!user) throw new NotFoundException('User not found');

		return { ...user, password: undefined };
	}
}
