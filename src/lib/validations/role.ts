import { z } from 'zod'

export const updateRoleSchema = z.object({
  role: z.enum(['FOUNDER', 'MEMBER'], {
    errorMap: () => ({ message: 'Role must be either FOUNDER or MEMBER' }),
  }),
})

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>
