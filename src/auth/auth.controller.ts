import { Controller, Post, Body, BadRequestException, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './register.dto';
import { LoginDto } from './login.dto';
import { ApiTags, ApiResponse, ApiOkResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @ApiResponse({ status: 400, description: 'Email already exists.' })
  async register(@Body() dto: RegisterDto) {
    try {
      const user = await this.authService.register(dto.email, dto.password);
      return { id: user.id, email: user.email };
    } catch (e) {
      throw new BadRequestException('Email already exists');
    }
  }

  @Post('login')
  @ApiResponse({ status: 201, description: 'Login successful.' })
  @ApiResponse({ status: 400, description: 'Invalid credentials.' })
  async login(@Body() dto: LoginDto) {
    const token = await this.authService.login(dto.email, dto.password);
    if (!token) {
      throw new BadRequestException('Invalid credentials');
    }
    return { access_token: token };
  }

  @Get('users')
  @ApiResponse({ status: 200, description: 'List all registered users.' })
  @ApiOkResponse({ schema: { type: 'array', items: { properties: { id: { type: 'number' }, email: { type: 'string' } } } } })
  async findAll() {
    return this.authService.findAll();
  }
}
