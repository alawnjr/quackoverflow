import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  userCode: defineTable({
    userId: v.string(),
    code: v.string(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),
});
