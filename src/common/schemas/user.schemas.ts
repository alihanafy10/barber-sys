import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as bcrypt from 'bcrypt';

import {  UserProviderType, UserRole } from "../shared";
import { Image } from "./interface/user.interface";
import { Wichlist } from "./wichlist.schemas";


@Schema({ timestamps: true,toJSON:{virtuals: true},toObject:{ virtuals: true }})
export class User {
  @Prop({
    type: String,
    required: true,
    trim: true,
    unique:true,
    minlength: 3,
    maxlength: 14,
  })
  name: string;
  @Prop({
    type: String,
    required: true,
    trim: true,
    unique: true,
  })
  email: string;
  @Prop({
    type: String,
    required: true,
    minlength: 6,
  })
  password: string;
  @Prop({
    type: String,
    required: true,
    enum: Object.values(UserRole),
    default: UserRole.USER,
  })
  userRole: string;
 
  @Prop({
    type: Boolean,
    default: false,
  })
  isEmailVerified: boolean;
  @Prop({
    type: Boolean,
    default: false,
  })
  isMarkedAsDeleted: boolean;
  @Prop({
    type: String,
    enum: Object.values(UserProviderType),
    default: UserProviderType.SYSTEM,
  })
  provider: string;
  @Prop({
    type: Object,
    required: false,
  })
  image: Image;
  @Prop({
    type: String,
    default: ''
  })
  otp: string;
  @Prop({
    type: Date,
    default: null
  })
  endDateOtp: Date;

  wichlists: Wichlist[];
}
const UserSchema = SchemaFactory.createForClass(User)

UserSchema.pre('save', function(next)  {
  this.password = bcrypt.hashSync(this.password, +process.env.SALT);
  next()
})

UserSchema.virtual("wichlists",{
  ref:'Wichlist',
  localField:'_id',
  foreignField:'adminId'
})

export const UserModel=MongooseModule.forFeature([{name:User.name,schema:UserSchema}])

