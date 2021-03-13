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
    const newUser = User.create(createUserDto);
    newUser.email = newUser.email.toLowerCase();
    // detect existing email
    await this.detectDuplicate(newUser, newUser.id);

    // save the new user and return the details
    return await this.userRepository.save(newUser);
  }

  private async detectDuplicate(user: User, id: string, isUpdate = false) {
    let userByEmail = await this.findOneByEmail(user.email);

    if (isUpdate) {
      const allUsers: User[] = await this.findAll();
      const allUsersExceptMe = allUsers.filter((x) => x.id !== id);

      userByEmail = allUsersExceptMe.find((x) => x.email.toLowerCase() === user.email.toLowerCase());
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

  async findOneByEmail(email: string): Promise<User> {
    const users: User[] = await this.findAll();
    const user: User = users.find((x) => x.email.toLowerCase() === email.toLowerCase());
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne(id);

    //Not found and conflict exceptions
    if (!user) throw new NotFoundException(`User with ID: ${id} not found`);
    await this.detectDuplicate(User.create(updateUserDto), id, true);

    //update
    for (const key in updateUserDto) {
      if (updateUserDto[key] !== user[key] && updateUserDto[key] !== null)
        user[key] = updateUserDto[key];
    }
    user.email = user.email.toLowerCase();
    return await this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async isAdmin(id: string): Promise<boolean> {
    const val = await (await this.findOne(id)).isAdmin;
    return val == null ? false : val;
  }

  async makeAdmin(id: string, makeAdmin: boolean): Promise<User> {
    const user = await this.findOne(id);

    if (!user) throw new NotFoundException(`User with ID: '${id}' not found`);
    user.isAdmin = makeAdmin;
    return await this.update(user.id, user);
  }
}
