import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

interface AuthenticatedUser {
  userId: number;
  email: string;
  role: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: AuthenticatedUser }>();
    return request.user;
  },
);
