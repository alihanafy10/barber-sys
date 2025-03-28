import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

import { UserService } from "./user.service";
import { Auth } from "../../common/decorator";
import { UserRole } from "../../common/shared";
import { ZodValidationPipe } from "../../common/pipes";
import {  bookTicketParamsDto, getAdminByNameQueryDto, updatePasswordBodyDto, updateUserBodyDto,  } from "./dto";
import { createFileUploadPipe } from '../../common/utils';
import { TbookTicketParamsDto, TgetAdminByNameQueryDto, TupdatePasswordBodyDto, TupdateUserBodyDto } from '../../common/types';
import { PaymobService } from '../../services/paymob/paymob.service';


@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService,
    private readonly paymobService: PaymobService
  ) {}

  @Put('updateUser')
  @UseInterceptors(FileInterceptor('image'))
  @Auth([ UserRole.ADMIN, UserRole.MANAGER, UserRole.USER])
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
  @Auth([UserRole.ADMIN,UserRole.USER, UserRole.MANAGER])
  async updatePass(
    @Body(new ZodValidationPipe(updatePasswordBodyDto))
    body: TupdatePasswordBodyDto,
    @Req() req:Request,
    @Res() res: Response
  ):Promise<Response> {
    await this.userService.updatePass(body, req);
    return res.status(201).json({ message: 'updated successfully'});
  }

  @Post("book-ticket/:_id")
  @Auth([UserRole.ADMIN,UserRole.USER, UserRole.MANAGER])
  async bookTicket(
    @Param(new ZodValidationPipe(bookTicketParamsDto)) param: TbookTicketParamsDto,
    @Req() req:Request,
    @Res() res: Response
  ):Promise<Response> {
    const data=await this.userService.bookTicket(req,param._id);
    
    return res.status(201).json({ message: 'success',data});
  }
  @Post("book-ticket")
  @Auth([UserRole.ADMIN])
  async fackeBookTicket(
    @Query(new ZodValidationPipe(getAdminByNameQueryDto)) query: TgetAdminByNameQueryDto,
    @Req() req:Request,
    @Res() res: Response
  ):Promise<Response> {
    const data=await this.userService.fackeBookTicket(req,query.name);
    
    return res.status(201).json({ message: 'success',data});
  }

@Put("open-and-close")
@Auth([UserRole.ADMIN])
async openAndClose(
  @Req() req:Request,
  @Res() res: Response
):Promise<Response> {
  const data:string=await this.userService.openAndClose(req);
  
  return res.status(201).json({ message: data});
}

  @Get('specific-admin')
  @Auth([UserRole.ADMIN,UserRole.USER, UserRole.MANAGER])
  async getAdminByName(
    @Query(new ZodValidationPipe(getAdminByNameQueryDto))
    query: TgetAdminByNameQueryDto,
    @Res() res: Response
  ):Promise<Response> {
    const data=await this.userService.getAdminByName(query.name);
    
    return res.status(200).json({ message: 'success',data});
  }

  @Get('worck-space/:_id')
  @Auth([UserRole.ADMIN,UserRole.USER, UserRole.MANAGER])
  async worckSpace(
    @Param(new ZodValidationPipe(bookTicketParamsDto)) param: TbookTicketParamsDto,
    @Res() res: Response
  ):Promise<Response> {
    const data=await this.userService.worckSpace(param._id);
    return res.status(200).json({ message: 'success',data});
  }

  @Get('profile')
  @Auth([UserRole.ADMIN,UserRole.USER, UserRole.MANAGER])
  async myProfile(
    @Req() req:Request,
    @Res() res: Response
  ):Promise<Response> {
    const data=await this.userService.myProfile(req);
    data.password=undefined
    return res.status(200).json({ message: 'success',data});
  }

  @Put('cancel-reservation-user/:_id')
  @Auth([UserRole.USER])
  async cancelReservationUser(
    @Param(new ZodValidationPipe(bookTicketParamsDto)) param: TbookTicketParamsDto,
    @Req() req:Request,
    @Res() res: Response
  ):Promise<Response> {
    const data=await this.userService.cancelReservationUser(req,param._id);
    return res.status(201).json({ message: 'success',data});
  }

  @Put('cancel-reservation-admin/:_id')
  @Auth([UserRole.ADMIN])
  async cancelReservationAdmin(
    @Param(new ZodValidationPipe(bookTicketParamsDto)) param: TbookTicketParamsDto,
    @Req() req:Request,
    @Res() res: Response
  ):Promise<Response> {
    const data=await this.userService.cancelReservationAdmin(req,param._id);
    return res.status(201).json({ message: 'success',data});
  }

  @Delete("deleteAcc")
  @Auth([UserRole.ADMIN,UserRole.USER, UserRole.MANAGER])
  async deleteAcc(
    @Req() req:Request,
    @Res() res: Response
  ):Promise<Response>{
    await this.userService.deleteAcc(req);
    return res.status(201).json({ message: 'delete successfully'});
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
          if (query.success) {
              // success_url
              return res.redirect('https://fresh-cart-zeta.vercel.app/#/wishlist');
          } else {
              // cancel_url
              return res.redirect('https://fresh-cart-zeta.vercel.app/#/cart');
          }
      }
  
}

