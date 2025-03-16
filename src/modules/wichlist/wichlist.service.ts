import { BadRequestException, Injectable } from "@nestjs/common";
import { Request } from "express";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { User, Wichlist } from "../../common/schemas";
import { UserRole } from "../../common/shared";

@Injectable()
export class WichlistService{
     constructor(
        @InjectModel(Wichlist.name) private wichlistModel: Model<Wichlist>,
         @InjectModel(User.name) private userModel: Model<User>,
        
      ) {}

      /**
       * 
       * @param {Request}req 
       * @param {string}adminId 
       * 
       * @throws {BadRequestException}-Only admins can be added to wishlist
       * @throws {BadRequestException}-alrady in wichlist
       * 
       * @returns {Wichlist}
       */
    async addToWichlist(req:Request|any,adminId:string):Promise<Wichlist>{
        //chik if admin her 
        const admin:any=await  this.userModel.findOne({_id:adminId,userRole:UserRole.ADMIN}).populate("wichlists")
        if(!admin)throw new BadRequestException("Only admins can be added to wishlist");

        //chick if in wichlist or not to add
        const isExsist=await admin.wichlists.find((ele:any) => 
            ele.userId.toString()==req.authUser._id.toString()
        )
        if(isExsist)throw new BadRequestException("alrady in wichlist")

            //add in wichlist
            const wichlist=await this.wichlistModel.create({userId:req.authUser._id,adminId})
           
        return wichlist
    }

    /**
     * 
     * @param {Request}req 
     * @returns {Wichlist[]}
     */
    async getMyWichlist(req:Request|any):Promise<Wichlist[]>{
        const data=await this.wichlistModel.find({userId:req.authUser._id}).populate({path:"adminId",select:"-password"})
        return data
    }

    /**
     * 
     * @param {Request}req 
     * @param {string}wichlistId 
     * 
     * @throws {BadRequestException}-can not delete
     * 
     * @returns {any}
     */
    async deleteFromWichlist(req:Request|any,wichlistId:string):Promise<any>{
        const data:any=await this.wichlistModel.deleteMany({_id:wichlistId,userId:req.authUser._id})

        if(!data.deletedCount)throw new BadRequestException("can not delete")
            
        return data

    }
}