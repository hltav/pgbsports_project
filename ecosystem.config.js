require('dotenv').config();

module.exports = {
  apps: [
    {
      name: "pgb_sports",
      script: "dist/main.js",
      env: {
        NODE_ENV: "production",
        DATABASE_URL: process.env.DATABASE_URL,
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
        MAIL_SERVICE_API: process.env.MAIL_SERVICE_API,
        CACHE_TTL_SECONDS: process.env.CACHE_TTL_SECONDS,
        SPORTRADAR_API_KEY: process.env.SPORTRADAR_API_KEY,
        APISPORTS_API_KEY: process.env.APISPORTS_API_KEY,
        MAIL_HOST: process.env.MAIL_HOST,
        MAIL_PORT: process.env.MAIL_PORT,
        MAIL_USER: process.env.MAIL_USER,
        MAIL_PASS: process.env.MAIL_PASS,
        MAIL_FROM: process.env.MAIL_FROM,
        FRONTEND_URL: process.env.FRONTEND_URL
      }
    }
  ]
};
