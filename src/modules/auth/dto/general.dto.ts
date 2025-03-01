import { generalRules } from '../../../common/shared';
import { z } from 'zod';

export const forgetPasswordBodyDto = z
  .object({
    email: z.string().email(),
  })
  .strict();

export const resetPasswordBodyDto = z
  .object({
    email: z.string().email(),
    newPassword: generalRules.password,
    otp:z.string().length(5),
  })
  .strict();
