import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { WichlistModule } from './modules/wichlist/wichlist.module';
import { TasksService } from './services';
import { AdminModel, UserModel, WichlistModel } from './common/schemas';





@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.${process.env.NODE_ENV}.env`, '.env'],
    }),
    MongooseModule.forRoot(process.env.MONGOOSE_URI as string),
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
    WichlistModule,
    UserModel,
    WichlistModel,
    AdminModel
  ,
  ],
  controllers: [],

  providers: [TasksService],
})
export class AppModule {}
