import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get user's code
export const getUserCode = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const userCode = await ctx.db
      .query("userCode")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!userCode) {
      // Return default code if user doesn't have any saved code
      console.log(
        `No saved code found for userId: ${args.userId}, returning default`
      );
      return {
        code: `// Your code here
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));`,
        updatedAt: Date.now(),
        isDefault: true,
      };
    }

    console.log(`Found saved code for userId: ${args.userId}`);
    return {
      code: userCode.code,
      updatedAt: userCode.updatedAt,
      isDefault: false,
    };
  },
});

// Update user's code
export const updateUserCode = mutation({
  args: {
    userId: v.string(),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(
      `Updating code for userId: ${args.userId}, code length: ${args.code.length}`
    );

    const existing = await ctx.db
      .query("userCode")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      console.log(`Patching existing record for userId: ${args.userId}`);
      await ctx.db.patch(existing._id, {
        code: args.code,
        updatedAt: Date.now(),
      });
    } else {
      console.log(`Inserting new record for userId: ${args.userId}`);
      await ctx.db.insert("userCode", {
        userId: args.userId,
        code: args.code,
        updatedAt: Date.now(),
      });
    }

    console.log(`Successfully saved code for userId: ${args.userId}`);
  },
});
