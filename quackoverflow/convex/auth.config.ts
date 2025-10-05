// Convex auth configuration for Clerk
export default {
  providers: [
    {
      domain:
        process.env.CLERK_JWT_ISSUER_DOMAIN ||
        "https://clerk.quackoverflow.dev",
      applicationID: "convex",
    },
  ],
};
