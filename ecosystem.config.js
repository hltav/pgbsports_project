module.exports = {
  apps: [
    {
      name: "pgb_sports",
      script: "dist/main.js",
      env: {
        NODE_ENV: "production",
        DATABASE_URL: "DATABASE_URL",
        JWT_SECRET: "JWT_SECRET",
        JWT_EXPIRES_IN: "JWT_EXPIRES_IN",
        MAIL_SERVICE_API: "MAIL_SERVICE_API",
        CACHE_TTL_SECONDS: "CACHE_TTL_SECONDS",
        SPORTRADAR_API_KEY: "SPORTRADAR_API_KEY",
        APISPORTS_API_KEY: "APISPORTS_API_KEY",
        MAIL_HOST: "MAIL_HOST",
        MAIL_PORT: "MAIL_PORT",
        MAIL_USER: "MAIL_USER",
        MAIL_PASS: "MAIL_PASS",
        MAIL_FROM: "MAIL_FROM",
        FRONTEND_URL: "FRONTEND_URL"
      }
    }
  ]
};
