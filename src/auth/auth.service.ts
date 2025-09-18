import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({ email, password: hashedPassword });
    return this.usersRepository.save(user);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }

  async login(email: string, password: string): Promise<string | null> {
    const user = await this.validateUser(email, password);
    if (!user) return null;
    return this.jwtService.sign({ sub: user.id, email: user.email });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ select: ['id', 'email'] });
  }
}
