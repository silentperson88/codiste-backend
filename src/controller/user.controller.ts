import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Req,
  Query,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { CreateUserDto } from '../dto/user/create-user.dto';
import { UpdateUserDto } from '../dto/user/update-user.dto';
import * as bcrypt from 'bcrypt';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    return this.userService.create(createUserDto);
  }

  @Post('login')
  async login(@Body() createUserDto: CreateUserDto) {
    const { email } = createUserDto;
    const validUser = await this.userService.findUserByEmail(email);

    if (!validUser) {
      return {
        message: 'User not found',
      };
    }

    const isValidCredential = await this.userService.validatePassword(
      createUserDto.password,
      validUser.password,
    );

    if (!isValidCredential) {
      return {
        message: 'Invalid credentials',
      };
    }
    // Assuming user is valid, generate and return a JWT token
    const token = await this.userService.generateToken(validUser);
    return { token };
  }

  @Get('profile')
  async profile(@Req() request) {
    const token =
      request.headers.authorization &&
      request.headers.authorization.split(' ')[1];
    if (!token) {
      return {
        message: 'Token not found',
      };
    }
    const decoded = await this.userService.validateToken(token);

    if (!decoded) {
      return {
        message: 'Invalid token',
      };
    }

    return decoded;
  }

  @Get()
  findAll(@Query() query): Promise<any> {
    const { page = 1, limit = 10, searchTerm } = query;
    console.log('page', page, 'limit', limit, 'searchTerm', searchTerm);
    return this.userService.findAll(page, limit, searchTerm);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
