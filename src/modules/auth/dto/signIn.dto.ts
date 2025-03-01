import { z } from "zod";

import { generalRules } from "../../../common/shared";

export const signInBodyDto = z
  .object({
    email: z.string().email(),
    password: generalRules.password,
  })
  .strict();