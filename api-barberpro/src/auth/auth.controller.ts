/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() body: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.authService.signIn(body.email, body.senha);
  }
}
