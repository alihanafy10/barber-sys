import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { AdminModel, UserModel, WichlistModel } from "../../common/schemas";
import { WichlistController } from "./wichlist.controller";
import { WichlistService } from "./wichlist.service";


@Module({
  imports: [UserModel,AdminModel,WichlistModel],
  controllers: [WichlistController],
  providers: [WichlistService, JwtService],
})
export class WichlistModule {}