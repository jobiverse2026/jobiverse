import type { z } from "zod";

import type { employerSchema } from "@/validation/employer";

export type EmployerRequirement = z.infer<typeof employerSchema>;
