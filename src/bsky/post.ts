import z from "zod";

export const PostCreatedSchema = z.object({
    uri: z.string(),
    text: z.string(),
    author: z.string(),
    createdAt: z.string(),
    langs: z.array(z.string()),
});
export type PostCreated = z.infer<typeof PostCreatedSchema>;
