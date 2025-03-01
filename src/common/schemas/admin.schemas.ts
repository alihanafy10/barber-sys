import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";


@Schema({ timestamps: true })
export class Admin {
    @Prop({
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      })
      userId: mongoose.Schema.Types.ObjectId;
}
const adminSchema = SchemaFactory.createForClass(Admin)



export const AdminModel=MongooseModule.forFeature([{name:Admin.name,schema:adminSchema}])