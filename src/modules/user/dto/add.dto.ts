import { z } from "zod";
import { objectIdRule } from "../../../common/shared";

// //book Ticket 
export const bookTicketParamsDto = z
  .object({
    _id: z.string().refine(objectIdRule, {
      message: 'Invalid ObjectId',
    }),
  })
  .strict();