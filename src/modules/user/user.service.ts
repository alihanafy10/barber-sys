import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Admin, User } from "../../common/schemas";
import { Model } from "mongoose";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { EmailService } from "../../services/email/email.service";
import { CheakExisit } from "../../services";
import { TupdatePasswordBodyDto, TupdateUserBodyDto } from "../../common/types";
import { UserRole } from "src/common/shared";
import path from "path";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Admin.name) private adminModel: Model<Admin>,
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
   * @returns {void}
   * */
  async updatePass(body: TupdatePasswordBodyDto,req: any):Promise<void> {
    const authUser = req.authUser
    authUser.password = body.password
    await authUser.save();
  };

/**
 * 
 * @param {string}name 
 * @throws {BadRequestException}-barber not found
 * @returns {Admin}
 */
  async getAdminByName(name:string):Promise<Admin>{
    
    
    const admin=await this.userModel.findOne({name:name,userRole:UserRole.ADMIN,isMarkedAsDeleted:false})
    
    
    //cheack if admin found
    if(!admin) throw new BadRequestException("barber not found")
      //get admin data
      const adminData:any=await this.adminModel.findOne({userId:admin._id}).populate("userId")
      console.log(adminData);
      
    //ignor password
    adminData.userId.password=undefined
      
    return adminData
  }

  /**
   * 
   * @param {Request}req 
   * @param {string}_id 
   * 
   * @throws {BadRequestException}-barber not found
   * @throws {BadRequestException}-barber is closed now
   * @throws {BadRequestException}-you are allrady booking
   * 
   * @returns {Admin}
   */
async bookTicket(req:Request|any,_id:string):Promise<Admin>{
  const admin:Admin|any=await this.adminModel.findOne({userId:_id}).populate({
    path:"userId",
  })
   //cheack if admin found
   if(!admin||admin.userId.isMarkedAsDeleted) throw new BadRequestException("barber not found")
   if(!admin.opened)throw new BadRequestException("barber is closed now")
    //cheick exisit
  const exisiting:boolean= admin.clints.find((ele: { clintId: { toString: () => any; }; })=>{
    if(ele.clintId.toString()==req.authUser._id.toString())return true
  })
  if(exisiting)throw new BadRequestException("you are allrady booking")

    //bock ticket
  admin.clints.push({clintId:req.authUser._id})
  await admin.save()
  let data = await this.adminModel.findById(admin._id).populate({
    path: "clints.clintId",
    select: "-password", 
  });
 
  return data
}

 /**
   * 
   * @param {Request}req 
   * @param {string}_id 
   * 
   * @throws {BadRequestException}-barber not found
   * @throws {BadRequestException}-you must open first
   * 
   * @returns {Admin}
   */
async fackeBookTicket(req:Request|any,name:string):Promise<Admin>{
  const admin:Admin|any=await this.adminModel.findOne({userId:req.authUser._id}).populate("userId")
   //cheack if admin found
   if(!admin) throw new BadRequestException("barber not found")
   if(!admin.opened)throw new BadRequestException("you must open first")

    //bock ticket
  admin.clints.push({clintId:req.authUser._id,name})
  await admin.save()
  let data = await this.adminModel.findById(admin._id).populate({
    path: "clints.clintId",
    select: "-password", 
  });
 
  return data
}

/**
 * 
 * @param {Request}req 
 * @throws {BadRequestException}-barber not found
 * @returns {string}
 */
async openAndClose(req:Request|any):Promise<string>{
  const data=await this.adminModel.findOne({userId:req.authUser._id})
  if(!data) throw new BadRequestException("barber not found")
  if(data.opened){
    data.opened=false
    data.clints=[]
    await data.save()
    return "closed success"
  }
  data.opened=true
  await data.save()
    return "opend success"
}

/**
 * 
 * @param {string}_id 
 * @throws {BadRequestException}-barber not found
 * @returns {Admin}
 */
async worckSpace(_id:string):Promise<Admin>{
  const data=await this.adminModel.findOne({userId:_id}).populate([{
    path: "clints.clintId",
    select: "-password", 
  },
{
  path:"userId",
  select:"-password"
}]);
  if(!data) throw new BadRequestException("barber not found")
  return data
}

/**
 * 
 * @param {Request}req 
 * @returns {User}
 */
async myProfile(req:Request|any):Promise<User>{
  const data=await this.userModel.findById(req.authUser._id)
  return data
}

/**
 * 
 * @param {Request}req 
 * @param {string}admin_id 
 * 
 * @throws {BadRequestException} -admin not found
 * 
 * @returns 
 */
async cancelReservationUser(req:any|Request,admin_id:string):Promise<Admin>{
  //check if admin her
  const admin:Admin|any=await this.adminModel.findOne({userId:admin_id}).populate([{
    path: "clints.clintId",
    select: "-password", 
  },{
    path:"userId"
  }]);
  if (!admin||admin.userId.isMarkedAsDeleted) throw new BadRequestException("not found");

//delet your Reservation
  admin.clints=admin.clints.filter(ele=>
    (ele.clintId as any)._id.toString()!=req.authUser._id.toString()
)

//save data
const data=await admin.save()
return data
}

/**
 * 
 * @param {Request}req 
 * @param {string}admin_id 
 * 
 * @throws {BadRequestException} -clint not found
 * 
 * @returns 
 */
async cancelReservationAdmin(req:any|Request,clint_id:string):Promise<Admin>{
  //check if clint booking
  const admin:Admin|any=await this.adminModel.findOne({userId:req.authUser._id,"clints._id":clint_id}).populate([{
    path: "clints.clintId",
    select: "-password", 
  },{
    path:"userId"
  }]);
  if (!admin) throw new BadRequestException("clint not found");

//delet Reservation
  admin.clints=admin.clints.filter((ele:any)=>
    ele._id.toString()!=clint_id.toString()
)

//save data
const data=await admin.save()
return data
}
/**
 * 
 * @param {Request}req 
 */
async deleteAcc(req:Request|any):Promise<void>{
await this.userModel.updateOne({_id:req.authUser._id},{isMarkedAsDeleted:true})
}

}