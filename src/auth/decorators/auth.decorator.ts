import { UseGuards, applyDecorators } from '@nestjs/common';
import { TypeRole } from '../auth.interface';
import { JwtAuthGuard } from '../guards/jwt.guard';

export const Auth = (role: TypeRole = 'user') =>
	applyDecorators(UseGuards(JwtAuthGuard));
