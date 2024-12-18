import {z} from 'zod';

export const AcceptMessageSchema = z.object({
    accceptMessages: z.boolean(),
})