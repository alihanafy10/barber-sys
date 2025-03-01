import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schemas';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    //check if there is a token in headers
    const { token } = request.headers;
    if (!token) throw new BadRequestException('token not found');

    //check tocken prefex
    if (!token.startsWith('7ambola'))
        throw new BadRequestException('token not valid');
      
    //split token
      const originalToken = token.split(' ')[1];
      
    //decode token
    const data = this.jwtService.verify(originalToken, {
      secret: process.env.VERIFY_TOKEN_USER,
    });
      if (!data._id) throw new BadRequestException('token not valid');
      
    //find user in db
    const user = await this.userModel.findById(data._id);
    if (!user) throw new BadRequestException('token not valid');
    if(!user.isEmailVerified) throw new BadRequestException('you must verify your email')
    if(user.isMarkedAsDeleted) throw new BadRequestException("your acc hasn't been marked as deleted")
      
    //inject user data in request
    request.authUser = user;

    return true;
  }
}
