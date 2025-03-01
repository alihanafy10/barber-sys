import { z } from 'zod';

import {
  generalRules,
  objectIdRule,
  UserRole,
} from '../../../common/shared';

//update user body
export const updateUserBodyDto = z
  .object({
    name: z.string().min(3).max(14).optional(),
    email: z.string().email().optional(),
  })
  .strict();

export const updateUserRoleBodyDto = z
  .object({
    userRole: z.nativeEnum(UserRole),
  })
  .strict();

// //update userRole body
// export const updateUserRoleParamsDto = z
//   .object({
//     userId: z.string().refine(objectIdRule, {
//       message: 'Invalid ObjectId',
//     }),
//   })
//   .strict();


//update password body
export const updatePasswordBodyDto = z
  .object({
    password: generalRules.password,
  })
  .strict();