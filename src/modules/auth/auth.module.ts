import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import {  UserModel } from "../../common/schemas";
import { CloudinaryModule } from "../cloudinary/cloudinary.module";
import { EmailModule } from "../../services/email/email.module";
import { CheakExisit } from "../../services";

@Module({
  imports: [UserModel, CloudinaryModule, EmailModule],
  controllers: [AuthController],
  providers: [AuthService, JwtService,CheakExisit],
})
export class AuthModule {}