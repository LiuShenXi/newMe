import { IsNotEmpty, IsString } from 'class-validator';
import type { LoginRequest, RefreshRequest } from '@newme/shared';

export class LoginDto implements LoginRequest {
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;
}

export class RefreshTokenDto implements RefreshRequest {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
