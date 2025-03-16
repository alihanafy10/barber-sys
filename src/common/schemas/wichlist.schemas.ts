import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { Clints } from "./interface";


@Schema({ timestamps: true })
export class Wichlist {
    @Prop({
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      })
      userId: mongoose.Schema.Types.ObjectId;
     
      @Prop({
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      })
      adminId: mongoose.Schema.Types.ObjectId;
}
const wichlistSchema = SchemaFactory.createForClass(Wichlist)



export const WichlistModel=MongooseModule.forFeature([{name:Wichlist.name,schema:wichlistSchema}])