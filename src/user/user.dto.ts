import { IsString } from 'class-validator';

export class UserDto {
  @IsString()
  email: string;
  @IsString()
  password: string;
  @IsString()
  firstName: string;
  @IsString()
  lastName: string;
  @IsString()
  image: string;
  pdf: Buffer;
}
