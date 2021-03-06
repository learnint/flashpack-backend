import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Not, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { PackType } from 'src/pack/constants';
import { PackService } from 'src/pack/pack.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => PackService))
    private readonly packService: PackService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = User.create(createUserDto);
    newUser.email = newUser.email.toLowerCase();
    // detect existing email
    await this.detectDuplicate(newUser, newUser.id);

    // save the new user and return the details
    return await this.userRepository.save(newUser);
  }

  private async detectDuplicate(
    user: User,
    id: string,
    isUpdate = false,
  ): Promise<void> {
    let userByEmail = await this.findOneByEmail(user.email);

    if (isUpdate) {
      userByEmail = await this.userRepository.findOne({
        where: { id: Not(id), email: user.email.toLowerCase() },
      });
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
    const user = await this.userRepository.findOne(id);
    return user;
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne(id);

    //Not found and conflict exceptions
    if (!user) throw new NotFoundException(`User with ID: ${id} not found`);
    if (updateUserDto.email && updateUserDto.email !== '')
      await this.detectDuplicate(User.create(updateUserDto), id, true);

    //update
    for (const key in updateUserDto) {
      if (updateUserDto[key] !== user[key] && updateUserDto[key] !== null)
        user[key] = updateUserDto[key];
    }
    return await this.userRepository.save(user);
  }

  async updateUserPassword(
    id: string,
    updateUserPasswordDto: UpdateUserPasswordDto,
  ): Promise<User> {
    const user = await this.userRepository.findOne(id);
    //Not found and conflict exceptions
    if (!user) throw new NotFoundException(`User with ID: ${id} not found`);
    if (
      updateUserPasswordDto.oldPassword &&
      updateUserPasswordDto.newPassword
    ) {
      const isMatch = user
        ? await bcrypt.compare(updateUserPasswordDto.oldPassword, user.password)
        : false;
      if (!isMatch) {
        throw new UnprocessableEntityException(
          'original password does not match records',
        );
      }
    }
    user.password = updateUserPasswordDto.newPassword;
    //update
    return await this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException(`User with ID: '${id}' not found`);
    // also delete any packs connected to the user
    const packsToDelete = await this.packService.findAllForUserOrGroup(
      user.id,
      PackType.User,
    );

    await this.userRepository.delete(id);

    for (const pack of packsToDelete) {
      await this.packService.remove(pack);
    }
  }

  async isAdmin(id: string): Promise<boolean> {
    const val = await (await this.findOne(id)).isAdmin;
    return val == null ? false : val;
  }

  async makeAdmin(id: string, makeAdmin: boolean): Promise<User> {
    const user = await this.findOne(id);

    if (!user) throw new NotFoundException(`User with ID: '${id}' not found`);
    user.isAdmin = makeAdmin;
    return await this.update(user.id, plainToClass(UpdateUserDto, user));
  }
}
