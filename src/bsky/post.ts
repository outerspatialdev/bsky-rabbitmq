import z from "zod";

// #region BaseOp
export const BaseOpSchema = z.object({
    op: z.string(),
    uri: z.string(),
    data: z.any(),
});

// #region Post
export const PostCreatedSchema = BaseOpSchema.extend({
    op: z.literal("post.create"),

    text: z.string(),
    author: z.string(),
    createdAt: z.string(),
    langs: z.array(z.string()),
});

export const PostDeletedSchema = BaseOpSchema.extend({
    op: z.literal("post.delete"),
});

export type PostCreated = z.infer<typeof PostCreatedSchema>;
export type PostDeleted = z.infer<typeof PostDeletedSchema>;

// #region Repost
export const RepostCreatedSchema = BaseOpSchema.extend({
    op: z.literal("repost.create"),
    author: z.string(),
    createdAt: z.string(),
});

export const RepostDeletedSchema = BaseOpSchema.extend({
    op: z.literal("repost.delete"),
});
export type RepostCreated = z.infer<typeof RepostCreatedSchema>;
export type RepostDeleted = z.infer<typeof RepostDeletedSchema>;

// #region Like
export const LikeCreatedSchema = BaseOpSchema.extend({
    op: z.literal("like.create"),
    author: z.string(),
    createdAt: z.string(),
});

export const LikeDeletedSchema = BaseOpSchema.extend({
    op: z.literal("like.delete"),
});

export type LikeCreated = z.infer<typeof LikeCreatedSchema>;
export type LikeDeleted = z.infer<typeof LikeDeletedSchema>;

// #region Follow
export const FollowCreatedSchema = BaseOpSchema.extend({
    op: z.literal("follow.create"),
    author: z.string(),
    createdAt: z.string(),
});

export const FollowDeletedSchema = BaseOpSchema.extend({
    op: z.literal("follow.delete"),
});

export type FollowCreated = z.infer<typeof FollowCreatedSchema>;
export type FollowDeleted = z.infer<typeof FollowDeletedSchema>;

// #region Op
const OpSchema = z.discriminatedUnion("op", [
    PostCreatedSchema,
    PostDeletedSchema,
]);

export type Op = z.infer<typeof OpSchema>;
