import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { AuthDto } from 'src/auth/dto/auth.dto';

export type TypeData = keyof AuthDto;

export const User = createParamDecorator(
	(data: TypeData, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest();
		const user = request.user;

		return data ? user[data] : user;
	}
);
