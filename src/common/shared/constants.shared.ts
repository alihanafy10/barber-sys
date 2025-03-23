
import { Types } from 'mongoose';
import { z } from 'zod';

export const extentions = {
  images: /(png|jpeg|jpg|gif|svg\+xml)/,
};

//general rules for zod validation
export const generalRules = {
  password: z
    .string()
    .min(6)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,10}$/,
      {
        message:
          'Minimum eight and maximum 10 characters, at least one uppercase letter, one lowercase letter, one number and one special character',
      },
    ),
 
  IdesRole:z.string().refine(objectIdRule, {
    message: 'Invalid ObjectId',
  }),
};

//validate _id from monngose
 export function objectIdRule(value:any) {
  return Types.ObjectId.isValid(value)?true:false
}


export const verifiedHtml= () => {
	return ` <div style="background: rgba(255, 255, 255, 0.1); padding: 30px; border-radius: 12px; text-align: center; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); backdrop-filter: blur(10px); width: 90%; margin:40px auto ;">
        
        <div style="font-size: 60px; color: #fff; margin-bottom: 15px;">🎉</div>
        
        <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">Email Verified Successfully</div>
        
        <div style="font-size: 18px; margin-bottom: 20px;">Your email has been successfully verified! You can now sign in.</div>
        
    </div>
`;
}

