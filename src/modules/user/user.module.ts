import { Module } from "@nestjs/common";

import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { JwtService } from "@nestjs/jwt";
import { AdminModel, UserModel } from "../../common/schemas";
import { CloudinaryModule } from "../cloudinary/cloudinary.module";
import { EmailModule } from "../../services/email/email.module";
import { PaymobModule } from "../../services/paymob/paymob.module";
import { CheakExisit } from "../../services";


@Module({
  imports: [UserModel,CloudinaryModule,EmailModule,PaymobModule,AdminModel],
  controllers: [UserController],
  providers: [UserService, JwtService,CheakExisit],
})
export class UserModule {}