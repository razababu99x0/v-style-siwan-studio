# Deployment status

This deployment is a storefront demonstration. DATABASE_URL was not included in the archive; catalog fallback is enabled and submissions are blocked without it. Do not use for real orders or payments. Administration is disabled until authentication is implemented.

Set DATABASE_URL to a dedicated PostgreSQL database and apply the Drizzle schema before enabling persistence. Payment verification and canonical server-side pricing must be reviewed before commerce is enabled. Missing local photography uses remote illustrative image redirects; original custom artwork was not included.
