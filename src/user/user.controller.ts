import {
	Body,
	Controller,
	Delete,
	Get,
	Post,
	Put,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { User } from './decorators/user.decorator';
import { UserDto } from './user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get()
	async getUsers() {
		return this.userService.getAll();
	}

	@Get()
	@UsePipes(new ValidationPipe())
	async getOne(@Body() dto: UserDto) {
		return this.userService.getOne(dto);
	}

	@Post()
	@UsePipes(new ValidationPipe())
	async create(@Body() dto: UserDto) {
		return this.userService.create(dto);
	}

	@Put()
	@UsePipes(new ValidationPipe())
	async update(@Body() dto: UserDto) {
		return this.userService.update(dto);
	}

	@Delete()
	async delete(@Body() dto: UserDto) {
		return this.userService.delete(dto);
	}

	@Auth()
	// @UseGuards(JwtAuthGuard)
	@Get('files')
	async getFiles(@User('email') email: string) {
		return this.userService.byEmail(email);
	}
}
