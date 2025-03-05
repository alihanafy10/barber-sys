import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { Model } from 'mongoose';

import { User } from '../../common/schemas';
import { UserRole } from '../../common/shared';

@Injectable()
export class PaymobService {
     constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        
      ) {}
      private readonly apiKey = process.env.API_KEY
      
    async getPaymobToken():Promise<string> {
        const response = await axios.post('https://accept.paymob.com/api/auth/tokens', {
            api_key: this.apiKey,
        });
        return response.data.token; 
    }

    async createOrder(paymobToken: string, req: any|Request) {
        const response = await axios.post('https://accept.paymob.com/api/ecommerce/orders', {
            auth_token: paymobToken,
            "api_source": "INVOICE",
            "amount_cents": "100000",
            "currency": "EGP",
            "shipping_data": {
            "first_name": `${req.authUser.name}`,
            "last_name": "_",
            "phone_number": "01204753410",
            "email": `${req.authUser.email}`
            },
            "integrations": [
                5000678,
                5002535
            ]
        });
        return response.data; 
    }

    async webhoock(data:any){
        if(data.status){
           const updateData= await this.userModel.findOneAndUpdate( { email: data.order.shipping_data.email }, 
                {  userRole: UserRole.BARBER  },{new:true})
                return updateData
        }
        throw new BadRequestException("pay error")
        
    }
}