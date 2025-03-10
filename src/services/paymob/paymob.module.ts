import { Module } from "@nestjs/common";

import { AdminModel, UserModel } from "../../common/schemas";
import { PaymobService } from "./paymob.service";



@Module({
  imports: [UserModel,AdminModel],
  providers: [PaymobService],
  exports: [PaymobService],
  controllers: [],
})
export class PaymobModule {}