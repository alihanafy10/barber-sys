import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PaymobService {
    private readonly apiKey = process.env.API_KEY;

    async getPaymobToken() {
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

    webhoock(data:any){
        console.log(data);
        
    }
}