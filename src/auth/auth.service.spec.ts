import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

const mockUserRepo = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mocked-jwt-token'),
};

jest.mock('bcrypt', () => ({
  hash: jest.fn((password) => Promise.resolve('hashed_' + password)),
  compare: jest.fn((password, hash) => Promise.resolve(hash === 'hashed_' + password)),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userRepo;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepo = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register a user', async () => {
    mockUserRepo.create.mockReturnValue({ email: 'test@test.com', password: 'hashed' });
    mockUserRepo.save.mockResolvedValue({ id: 1, email: 'test@test.com', password: 'hashed' });
    const user = await service.register('test@test.com', 'password');
    expect(user.email).toBe('test@test.com');
    expect(user.password).not.toBe('password');
  });

  it('should validate user with correct password', async () => {
    mockUserRepo.findOne.mockResolvedValue({ email: 'test@test.com', password: 'hashed_password' });
    const user = await service.validateUser('test@test.com', 'password');
    expect(user).not.toBeNull();
  });

  it('should not validate user with wrong password', async () => {
    mockUserRepo.findOne.mockResolvedValue({ email: 'test@test.com', password: 'hashed_password' });
    const user = await service.validateUser('test@test.com', 'wrongpassword');
    expect(user).toBeNull();
  });

  it('should login and return jwt token', async () => {
    mockUserRepo.findOne.mockResolvedValue({ email: 'test@test.com', password: 'hashed_password' });
    const token = await service.login('test@test.com', 'password');
    expect(token).toBe('mocked-jwt-token');
  });

  it('should return null for login with wrong credentials', async () => {
    mockUserRepo.findOne.mockResolvedValue(null);
    const token = await service.login('test@test.com', 'wrongpassword');
    expect(token).toBeNull();
  });

  it('should list all users', async () => {
    mockUserRepo.find.mockResolvedValue([{ id: 1, email: 'test@test.com' }]);
    const users = await service.findAll();
    expect(users).toEqual([{ id: 1, email: 'test@test.com' }]);
  });
});
