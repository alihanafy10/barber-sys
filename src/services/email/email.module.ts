import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { EmailService } from "./email.service";



@Module({
  imports: [],
  providers: [EmailService, JwtService],
  exports: [EmailService],
  controllers: [],
})
export class EmailModule {}