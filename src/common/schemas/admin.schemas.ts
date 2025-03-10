import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { Clints } from "./interface";


@Schema({ timestamps: true })
export class Admin {
    @Prop({
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      })
      userId: mongoose.Schema.Types.ObjectId;
      @Prop({
        type:Boolean,
        default:false
      })
      opened:boolean;
      @Prop({
        type:[
          {
            clintId:{type:mongoose.Schema.Types.ObjectId,required:true,ref:"User"},
            name:{type:String}
          }
        ]
      })
      clints: Clints[];
}
const adminSchema = SchemaFactory.createForClass(Admin)



export const AdminModel=MongooseModule.forFeature([{name:Admin.name,schema:adminSchema}])