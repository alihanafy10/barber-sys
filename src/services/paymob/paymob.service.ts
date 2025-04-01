import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin, User } from '../../common/schemas';
import { UserRole } from '../../common/shared';

@Injectable()
export class PaymobService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Admin.name) private adminModel: Model<Admin>,
    ) {}
    private readonly apiKey = process.env.API_KEY;

    /**
     * @returns {Promise<string>} token
     */
    async getPaymobToken(): Promise<string> {
        const response = await fetch('https://accept.paymob.com/api/auth/tokens', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ api_key: this.apiKey })
        });
        
        const data = await response.json();
        console.log(data);
        
        return data.token;
    }

    /**
     * @param {string} paymobToken 
     * @param {Request} req 
     * @returns {Promise<any>} order
     */
    async createOrder(paymobToken: string, req: any | Request): Promise<any> {
        const response = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                auth_token: paymobToken,
                api_source: 'INVOICE',
                amount_cents: '100000',
                currency: 'EGP',
                shipping_data: {
                    first_name: req.authUser.name,
                    last_name: '_',
                    phone_number: '01204753410',
                    email: req.authUser.email,
                },
                integrations: [5000678, 5002535],
            })
        });
        return await response.json();
    }

    /**
     * @param {any} data 
     */
    async webhoock(data: any) {
        if (data.obj.success) {
            // Update role
            const updateData = await this.userModel.findOneAndUpdate(
                { email: data.obj.order.shipping_data.email },
                { userRole: UserRole.ADMIN },
                { new: true }
            );
            if (!updateData) throw new BadRequestException('User not found');

            // Create admin data
            await this.adminModel.create({ userId: updateData._id });
        } else {
            throw new BadRequestException('Something went wrong');
        }
    }
}
