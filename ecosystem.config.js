module.exports = {
  apps: [
    {
      name: 'rtsmanager',
      script: './dist/main.js',
      env: {
        NODE_ENV: 'production',
        APISPORTS_API_KEY: 'APISPORTS_API_KEY',
      },
    },
  ],
};
