import { Module } from "@nestjs/common";

import { UserModel } from "../../common/schemas";
import { PaymobService } from "./paymob.service";





@Module({
  imports: [UserModel],
  providers: [PaymobService],
  exports: [PaymobService],
  controllers: [],
})
export class PaymobModule {}