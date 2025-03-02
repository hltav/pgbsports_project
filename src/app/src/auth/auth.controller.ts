import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body('email') email: string, @Body('password') pass: string) {
    console.log('Identifier recebido:', email);
    console.log('Senha recebida:', pass);
    return this.authService.signIn(email, pass);
  }
}
