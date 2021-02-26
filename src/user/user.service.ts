import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    if (await this.findOneByUsername(createUserDto.userName)) {
      throw new ConflictException(
        `User '${createUserDto.userName}' already exists`,
      );
    }
    const user: User = User.create();

    for (const key in createUserDto) {
      user[key] = createUserDto[key];
    }
    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    return await this.userRepository.findOne(id);
  }

  async findOneByUsername(username: string): Promise<User> {
    const users: User[] = await this.findAll();
    const user: User = users.find((x) => x.userName === username);
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne(id);

    if (!user) throw new NotFoundException(`User with ID: ${id} not found`);

    for (const key in updateUserDto) {
      if (updateUserDto[key] !== user[key] && updateUserDto[key] !== null)
        user[key] = updateUserDto[key];
    }
    return await this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
}
