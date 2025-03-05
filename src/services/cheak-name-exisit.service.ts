import { BadRequestException, Injectable } from "@nestjs/common";

@Injectable()
export class CheakExisit{
    constructor() {}

      async cheakExisit(model:any,name:any): Promise<void>{
          const isNameExists = await model.findOne({ name });
          if (isNameExists) {
            throw new BadRequestException('name already exists')
          }
        }
      
}