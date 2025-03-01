import { z } from 'zod';

import {  generalRules } from '../../../common/shared';

export const signUpBodyDto = z
  .object({
    name: z.string().min(3).max(14),
    email: z.string().email(),
    password: generalRules.password,
    confirmPassword: z.string(),
  })
  .strict()
  .superRefine((data, ctx) => {
    // cheack if confirmePassword equal password
    if (data.confirmPassword !== data.password) {
      ctx.addIssue({
        code: 'custom',
        message: 'The confirmPassword did not match password',
        path: ['confirmPassword'],
      });
    }
  });



