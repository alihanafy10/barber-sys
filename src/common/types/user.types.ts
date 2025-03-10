import { z } from 'zod';

import { bookTicketParamsDto, getAdminByNameQueryDto, updatePasswordBodyDto, updateUserBodyDto } from '../../modules/user/dto';



export type TupdateUserBodyDto = z.infer<typeof updateUserBodyDto>;
export type TupdatePasswordBodyDto = z.infer<typeof updatePasswordBodyDto>;
export type TgetAdminByNameQueryDto = z.infer<typeof getAdminByNameQueryDto>;
export type TbookTicketParamsDto = z.infer<typeof bookTicketParamsDto>;


