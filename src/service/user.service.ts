import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from '../dto/user/create-user.dto';
import { UpdateUserDto } from '../dto/user/update-user.dto';
import { User, UserDocument } from '../schema/users.schema';
import { response } from '../entity/response.entity';
import { globalConstants } from '../utils/constants';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    try {
      const user = new this.userModel(createUserDto);
      return await user.save();
    } catch (error) {
      if (error.code === 11000) {
        response.message = globalConstants.duplicateEmail;
        response.status = 409;
        throw new ConflictException(response);
      } else {
        return error;
      }
    }
  }

  async findAll(
    page: number,
    limit: number,
    searchTerm?: string,
  ): Promise<any> {
    if (page === undefined || page === null || page === 0) page = 1;
    if (limit === undefined || limit === null || limit === 0) limit = 10;
    const skip = (page - 1) * limit;
    console.log('page', page, 'limit', limit, 'searchTerm', searchTerm);

    let query = {};
    if (searchTerm) {
      query = {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive name search
          { email: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive email search
        ],
      };
    }

    console.log('query', query);

    const users = await this.userModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .exec();

    console.log('users', users);

    return users;
  }

  async findOne(id: string) {
    return this.userModel.findById(id);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    return this.userModel.findByIdAndUpdate(id, updateUserDto);
  }

  async remove(id: string) {
    return this.userModel.findByIdAndDelete(id);
  }

  async findUserByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email: email });
  }

  async generateToken(user: UserDocument): Promise<string> {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }

  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // check accesstoken is valid, then user esict and is token expired
  async validateToken(token: string) {
    try {
      const decoded = await this.jwtService.verify(token);
      const user = await this.userModel.findById(decoded.sub);
      if (!user) {
        return false;
      }
      return user;
    } catch (error) {
      return false;
    }
  }
}
