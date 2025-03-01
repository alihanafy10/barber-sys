import { z } from 'zod';

import { updatePasswordBodyDto, updateUserBodyDto } from '../../modules/user/dto';



export type TupdateUserBodyDto = z.infer<typeof updateUserBodyDto>;
export type TupdatePasswordBodyDto = z.infer<typeof updatePasswordBodyDto>;


