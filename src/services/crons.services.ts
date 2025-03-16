import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { DateTime } from 'luxon';

import { Admin, User, Wichlist } from '../common/schemas';
import { UserRole } from '../common/shared';

@Injectable()
export class TasksService {
    constructor(private schedulerRegistry: SchedulerRegistry,
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Admin.name) private adminModel: Model<Admin>,
        @InjectModel(Wichlist.name) private wichlistModel: Model<Wichlist>
    ) {}

  @Cron('0 23 * * *',{name:'deleteAccount'})
  async deleteAcc () {

    console.log("Delete the account that has been deleted for 60 days");
    //get all user deleted their accounts 
    const usersData=await this.userModel.find({isMarkedAsDeleted:true})

    //data now 
    const dataNow=DateTime.now()

    if(usersData.length){
        usersData.forEach(async(user:any)=>{
            //created at
            const createdAt=DateTime.fromJSDate(user.createdAt)
            //diff
            const daysDiff=dataNow.diff(createdAt,'days').days
           if(daysDiff>60){
            //delete user
            await this.userModel.deleteMany({_id:user._id})
            //delete admin from workSpace
            await this.adminModel.deleteMany({userId:user._id})
            //delete wichlist
            await this.wichlistModel.deleteMany({userId:user._id})
           }
        })
    }
     
  }


  @Cron('0 21 * * * *',{name:'adminToUser'})
  async adminToUser() {
     

      console.log("convert admin to user");
      //get all admin
      const adminsData=await this.adminModel.find({})
        //data now 
    const dataNow=DateTime.now()
    if(adminsData.length){
        adminsData.forEach(async (admin:any)=>{
            //created at
            const createdAt=DateTime.fromJSDate(admin.createdAt)
            //diff
            const daysDiff=dataNow.diff(createdAt,'days').days
            console.log(daysDiff);
            if(daysDiff>365){
                //apdate to user
                await this.userModel.updateOne({_id:admin.userId},{userRole:UserRole.USER})
                //delete worck space
                await this.adminModel.deleteMany({_id:admin._id})
                
            }
            
        })
    }
    // const job = this.schedulerRegistry.getCronJob('adminToUser');
      
    // job?.stop();
  }
}