import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

import { UserService } from "./user.service";
import { Auth } from "../../common/decorator";
import { UserRole } from "../../common/shared";
import { ZodValidationPipe } from "../../common/pipes";
import {  updatePasswordBodyDto, updateUserBodyDto,  } from "./dto";
import { createFileUploadPipe } from '../../common/utils';
import { TupdatePasswordBodyDto, TupdateUserBodyDto } from '../../common/types';
import { PaymobService } from '../../services/paymob/paymob.service';


@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService,
    private readonly paymobService: PaymobService
  ) {}

  @Put('updateUser')
  @UseInterceptors(FileInterceptor('image'))
  @Auth([ UserRole.BARBER, UserRole.MANAGER, UserRole.USER])
  async updateUser(
    @Req() req: Request,
    @Res() res: Response,
    @Body(new ZodValidationPipe(updateUserBodyDto)) body: TupdateUserBodyDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Response> {
     //If the file exists from it via => createFileUploadPipe
     if (file) {
      await createFileUploadPipe().transform(file);
    }
    const data = await this.userService.updateUser(body, req, file);
    return res.status(201).json({ message: 'updated successfully', data });
  }


  @Put('updatePass')
  @Auth([UserRole.BARBER,UserRole.USER, UserRole.MANAGER])
  async updatePass(
    @Body(new ZodValidationPipe(updatePasswordBodyDto))
    body: TupdatePasswordBodyDto,
    @Req() req:Request,
    @Res() res: Response
  ):Promise<Response> {
    await this.userService.updatePass(body, req);
    return res.status(201).json({ message: 'updated successfully'});
  }

  //paymob
  @Post('create-session')
  @Auth([UserRole.USER])
  async createOrder(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response> {
      const authToken = await this.paymobService.getPaymobToken();
      const sessionData = await this.paymobService.createOrder(authToken,req);
      return res.status(201).json({ message: 'success', data: sessionData });
  }

  @Post('webhook-paymob-session')
  async webhoock(
    @Body() data: any,
    @Res() res: Response,
  ): Promise<Response> {
       await this.paymobService.webhoock(data);
      
      return res.status(201).json({ message: 'success'});
  }
  
      @Get("webhook-paymob")
      async handleResponseCallback(@Query() query: any, @Res() res: Response) {
          // تحقق من حالة الدفع باستخدام معلمات الاستعلام
          if (query.success === 'true') {
              // إعادة توجيه إلى صفحة النجاح
              return res.redirect('https://barber-sys1.vercel.app/success');
          } else {
              // إعادة توجيه إلى صفحة الفشل
              return res.redirect('https://barber-sys1.vercel.app/failure');
          }
      }
  
}

