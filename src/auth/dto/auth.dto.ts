import { IsEmail, IsString, MinLength } from 'class-validator';
import { UserDto } from 'src/user/user.dto';

export class AuthDto extends UserDto {
	@IsEmail()
	email: string;

	@MinLength(6, { message: 'Password cannot be less then 6 characters' })
	@IsString()
	password: string;
}
