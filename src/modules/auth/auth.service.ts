import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DateTime } from 'luxon';
import { nanoid } from 'nanoid';
import { OAuth2Client, TokenPayload } from 'google-auth-library';




import { User } from '../../common/schemas';
import { TforgetPasswordBodyDto, TresetPasswordBodyDto, TsignInBodyDto, TsignUpBodyDto } from '../../common/types';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { EmailService } from '../../services/email/email.service';
import { UserProviderType } from '../../common/shared';
import { CheakExisit } from '../../services';



@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly emailService: EmailService,
    private jwtService: JwtService,
    private readonly cheakExisit:CheakExisit
  ) {}

  /**
   * signup system
   * @param {TsignUpBodyDto} body
   * @param {Request} req
   * @param {Express.Multer.File} file? - The optional user profile image file.
   * 
   * @returns {User,Address} {savedUserData, addressObj}
   * 
   * @throws {BadRequestException} - If the provided email already exists in the system.
   */
  async signUp(
    body: TsignUpBodyDto,
    req: Request,
    file?: Express.Multer.File,
  ): Promise<User> {
    //featch data from body
    const {
      name,
      email,
      password,
    
    } = body;

        //cheak exisit name
        await this.cheakExisit.cheakExisit(this.userModel,name)

    //cheak email exists
    const isEmailExists = await this.userModel.findOne({ email });
    if (isEmailExists) {
      throw new BadRequestException('email already exists');
    }



    //uploade image
    let secure_url: string, public_id: string;
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadFile(file, {
        folder: `${process.env.UPLOADE_FOLDER}/Users`,
      });
      secure_url = uploadResult.secure_url;
      public_id = uploadResult.public_id;
    } else {
      const uploadResult = await this.cloudinaryService.uploadeImage(
        process.env.IMAGE_SECURE_URL,
        {
          folder: `${process.env.UPLOADE_FOLDER}/Users`,
        },
      );
      secure_url = uploadResult.secure_url;
      public_id = uploadResult.public_id;
    }

    //obj of user
    const userObj = new this.userModel({
      name,
      email,
      password,
      image: {
        secure_url,
        public_id,
      },
    });

    //save data user
    const savedUserData = await userObj.save();

    //ignore password
    savedUserData.password = undefined;

    //send email
    await this.emailService.sendEmails(email, name, req);

    return  savedUserData ;
  }

  /**
   * verify Email
   * @param {string} token - The JWT token containing the user's email.
   * @throws {UnauthorizedException} If the token is invalid or expired.
   */
  async verifyEmaill(token: string): Promise<void> {
    try {
      //verify token
      const data = await this.jwtService.verify(token, {
        secret: process.env.VERIFY_TOKEN_EMAIL,
      });
      if (!data) throw new UnauthorizedException('Invalid or expired token');

      //change emailVerification to true
      await this.userModel.findOneAndUpdate(
        { email: data.email },
        { isEmailVerified: true },
      );
    } catch (error) {
      throw new UnauthorizedException('Token verification failed');
    }
  }

  /**
   * signin system
   * @param {TsignInBodyDto} body
   * 
   * @throws {NotFoundException} -if email or password are not valid.
   * @throws {UnauthorizedException} -if you are not confirmed email.
   * 
   * @returns {string} The generated authentication token.
   */
  async signIn(body: TsignInBodyDto): Promise<string> {
    //extruct data from body
    const { email, password } = body;

    //check if email exists
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('email or password not valid');

    //check if password valid
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword)
      throw new NotFoundException('email or password not valid');

    //check if user confirmed his email
    if (user.isEmailVerified == false)
      throw new UnauthorizedException('you must confirm your email');

    //generate user token
    const token = this.jwtService.sign(
      { _id: user._id, email: user.email, role: user.userRole },
      {
        secret: process.env.VERIFY_TOKEN_USER,
        expiresIn: '30 days',
      },
    );
    return token;
  }



  /**
   *
   * @param email
   * @throws {NotFoundException } -not found user
   * @returns {string} => dto sended successfully
   */
  async forgetPassword(body: TforgetPasswordBodyDto): Promise<string> {
    //fetch user data
    const user = await this.userModel.findOne({ email:body.email });

    //check if user available
    if (!user) throw new NotFoundException('user not found');

    //create otp by nanoId
    const otp = nanoid(5);

    //add otp to user
    user.otp = otp;
    
    ////add date +1m to distroy otp
    const date = DateTime.now().plus({ minutes: 3 }).toJSDate();
    user.endDateOtp = date;

    //save user data
    await this.userModel.updateOne({ email:body.email }, user);

    //send otp email
    await this.emailService.sendEmailsOtp(otp, user.name, user.email);

    return 'dto sended successfully';
  }

  /**
   * @param body
   * 
   * @throws {NotFoundException } -not found user
   * @throws {BadRequestException } -id otp is invalid
   * 
   * @return {string} => password reseted successfully
   */
  async resetPassword(body: TresetPasswordBodyDto): Promise<string> {

    //featch user data
    const user = await this.userModel.findOne({ email: body.email });

    //check if user available
    if (!user) throw new NotFoundException('user not found');

    //check id otp valid
    if (DateTime.now().toJSDate() > user.endDateOtp || body.otp != user.otp)
      throw new BadRequestException('invalid OTP');

    //update data
    user.password = body.newPassword;
    user.otp = undefined;
    user.endDateOtp = null;

    //save user data and hash password
    await user.save();

    return 'password reseted successfully';
  }

  //googleeeeeeeeeeeeeeeee


    /**
   * signin with google
   * @param {string} token
   * 
   * @throws {BadRequestException} -if email not verifid by google.
   * @throws {BadRequestException} -if user dose not signup first.
   * 
   * @returns {string} The generated authentication token.
   */
    async signinWithGoogle(token: string): Promise<string> {
     

      
      const client = new OAuth2Client();
      /**
       * @returns {TokenPayload} data of your email from google
       */
      async function verify(): Promise<TokenPayload> {
        try {
          const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.CLIENT_ID,
          });
          return ticket.getPayload();
        } catch (error) {
          console.error('Error verifying token', error);
          throw new BadRequestException('Invalid Google token');
        }
      }
      const result: any = await verify().catch(console.error);
  
      //check if email verification with google
      if (!result.email_verified) {
        throw new BadRequestException('invalid credentials');
      }
  
      //check if email exists
      const user = await this.userModel.findOne({
        email: result.email,
        provider: UserProviderType.GOOGLE,
      });
      if (!user) {
        throw new BadRequestException('Please sign up first');
      }
  
      //generate user token
      const _token = this.jwtService.sign(
        { _id: user._id, email: user.email, role: user.userRole },
        {
          secret: process.env.VERIFY_TOKEN_USER,
          expiresIn: '30 days',
        },
      );
      return _token;
    }
  
    /**
     * signup with google
     * @param {string} token
     * 
     * @throws {BadRequestException} -if email not verifid by google.
     * @throws {BadRequestException} -if email exists.
     * 
     * @returns {User} savedUserData
     */
    async signupWithGoogle(token: string): Promise<User> {
    
      const client = new OAuth2Client();
      /**
       * @returns {TokenPayload} data of your email from google
       */
      async function verify(): Promise<TokenPayload> {
        try {
          const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.CLIENT_ID,
          });
          return ticket.getPayload();
        } catch (error) {
          console.error('Error verifying token', error);
          throw new BadRequestException('Invalid Google token');
        }
      }
      const result: any = await verify().catch(console.error);
      //check if email verification with google
      if (!result.email_verified) {
        throw new BadRequestException('invalid credentials');
      }
  
      //cheak email exists
      const isEmailExists = await this.userModel.findOne({ email: result.email });
      if (isEmailExists) {
        throw new BadRequestException('email already exists');
      }
  
      // //uploade image
      const { secure_url, public_id } = await this.cloudinaryService.uploadeImage(
        result.picture,
        {
          folder: `${process.env.UPLOADE_FOLDER}/Users`,
        },
      );
  
      //generate random password
      const randomPassword = Math.random().toString(36).slice(2);
  
      // //obj of user
      const userObj = new this.userModel({
        name: result.name,
        email: result.email,
        password: randomPassword,
        isEmailVerified: true,
        provider: UserProviderType.GOOGLE,
        image: {
          secure_url,
          public_id,
        },
      });
  
      //save data user
      const savedUserData = await userObj.save();
  
      // //ignore password
      savedUserData.password = undefined;
  
      return savedUserData;
    }
  
}


