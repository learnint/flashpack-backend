import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth/auth.service';
import { LoginDto } from './user/dto/login-dto';

@ApiTags('login')
@Controller('/api')
export class AppController {
  constructor(private readonly authService: AuthService) {}

  @ApiInternalServerErrorResponse()
  @ApiBody({ type: LoginDto })
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}
