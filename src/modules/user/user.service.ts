import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "../../common/schemas";
import { Model } from "mongoose";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { EmailService } from "../../services/email/email.service";
import { CheakExisit } from "../../services";
import { TupdatePasswordBodyDto, TupdateUserBodyDto } from "../../common/types";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly emailService: EmailService,
    private readonly cheakExisit:CheakExisit
  ) {}

  /**
   *
   * @param {TupdateUserBodyDto} body 
   * @param {any} req -authUser 
   * @param file
   *
   * @throws {BadRequestException}-email already exists
   *
   * @returns {User}
   */
  async updateUser(
    body: TupdateUserBodyDto,
    req: any,
    file: Express.Multer.File,
  ): Promise<User> {
    //featch data from body
    const { name, email } = body;

    //authUser
    const authUser = req['authUser'];

    //check if email exists
    if (email) {
      //cheack if email exists
      const isEmailExist = await this.userModel.findOne({ email });
      if (isEmailExist) throw new BadRequestException('email already exists');
      await this.emailService.sendEmails(email, name, req);
      authUser.email = email;
      authUser.isEmailVerified = false;
    }
    if (name){ 

      //cheak if name exists
      await this.cheakExisit.cheakExisit(this.userModel,name)

      authUser.name = name;
    }

    if (file) {
      //splited public_id
      const splitedPublic_id = authUser.image.public_id.split('/')[2];

      const { public_id, secure_url } = await this.cloudinaryService.uploadFile(
        file,
        {
          folder: `${process.env.UPLOADE_FOLDER}/Users`,
          public_id: splitedPublic_id,
        },
      );
      authUser.image.public_id = public_id;
      authUser.image.secure_url = secure_url;
    }

    //updated user
    const updatedUserData = await this.userModel
      .findByIdAndUpdate(authUser._id, authUser, { new: true })
      .select('-password');

    return updatedUserData;
  }



  /**
   * update user password
   * @param {TupdatePasswordBodyDto} body
   * @param {any} req - authUser
   * */
  async updatePass(body: TupdatePasswordBodyDto,req: any):Promise<void> {
    const authUser = req.authUser
    authUser.password = body.password
    await authUser.save();
  };




}