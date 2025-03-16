import { Body, Controller, Delete, Get, Post, Req, Res } from "@nestjs/common";

import { WichlistService } from "./wichlist.service";
import { UserRole } from "../../common/shared";
import { Auth } from "../../common/decorator";
import { bookTicketParamsDto } from "../user/dto";
import { ZodValidationPipe } from "../../common/pipes";
import { TbookTicketParamsDto } from "../../common/types";
import { Request, Response } from "express";

@Controller("wichlist")
export class WichlistController{
constructor(
    private readonly wichlistService:WichlistService
){}

@Post('')
 @Auth([ UserRole.ADMIN, UserRole.MANAGER, UserRole.USER])
  async addToWichlist(
    @Req() req: Request,
    @Res() res: Response,
    @Body(new ZodValidationPipe(bookTicketParamsDto)) body: TbookTicketParamsDto,
  ): Promise<Response> {
    const data = await this.wichlistService.addToWichlist(req,body._id);
    return res.status(201).json({ message: 'add successfully', data });
  }
@Get('')
 @Auth([ UserRole.ADMIN, UserRole.MANAGER, UserRole.USER])
  async getMyWichlist(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response> {
    const data = await this.wichlistService.getMyWichlist(req);
    return res.status(200).json({ message: 'success', data });
  }

@Delete('')
 @Auth([ UserRole.ADMIN, UserRole.MANAGER, UserRole.USER])
  async deleteFromWichlist(
    @Req() req: Request,
    @Res() res: Response,
    @Body(new ZodValidationPipe(bookTicketParamsDto)) body: TbookTicketParamsDto,
  ): Promise<Response> {
    const data = await this.wichlistService.deleteFromWichlist(req,body._id);
    return res.status(200).json({ message: 'success', data });
  }
}