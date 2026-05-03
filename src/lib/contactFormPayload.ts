import { z } from 'zod';

/** Visitor fields validated before calling Web3Forms (free client-side API). */
export const contactFormFieldSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  email: z.string().trim().email('Enter a valid email').max(254),
  subject: z.string().trim().min(1, 'Subject is required').max(200),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(8000),
});

export type ContactFormFields = z.infer<typeof contactFormFieldSchema>;
