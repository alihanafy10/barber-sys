import { z } from "zod";

//get Admin By name
export const getAdminByNameQueryDto = z
  .object({
    name: z.string().min(3).max(14),
  })
  .strict();