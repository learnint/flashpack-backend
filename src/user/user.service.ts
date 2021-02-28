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
    // detect existing username/email
    await this.detectDuplicate(User.create(createUserDto));
    //create the new user as per defined in the request
    const user: User = User.create();

    for (const key in createUserDto) {
      user[key] = createUserDto[key];
    }
    return await this.userRepository.save(user);
  }

  private async detectDuplicate(user: User, isUpdate = false) {
    let userByUsername = await this.findOneByUsername(user.userName);
    let userByEmail = await this.findOneByEmail(user.email);

    if (isUpdate) {
      const userById = await this.userRepository.findOne(user.id);
      const allUsers: User[] = await this.findAll();
      const allUsersExceptMe = allUsers.filter((x) => x.id !== userById.id);

      userByUsername = allUsersExceptMe.find(
        (x) => x.userName === user.userName,
      );
      userByEmail = allUsersExceptMe.find((x) => x.email === user.email);
    }

    if (userByUsername) {
      throw new ConflictException(`User '${user.userName}' already exists`);
    }
    if (userByEmail) {
      throw new ConflictException(
        `A user with the email '${user.email}' already exists.`,
      );
    }
  }
  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    return await this.userRepository.findOne(id);
  }

  private async findOneByEmail(email: string): Promise<User> {
    const users: User[] = await this.findAll();
    const user: User = users.find((x) => x.email === email);
    return user;
  }

  async findOneByUsername(username: string): Promise<User> {
    const users: User[] = await this.findAll();
    const user: User = users.find((x) => x.userName === username);
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne(id);

    //Not found and conflict exceptions
    if (!user) throw new NotFoundException(`User with ID: ${id} not found`);
    await this.detectDuplicate(User.create(updateUserDto), true);

    //update
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
