module.exports = {
  apps: [
    {
      name: 'rtsmanager',
      script: './dist/main.js',
      cwd: '/home/hltav/rtsmanager_backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      // Configuração para DESENVOLVIMENTO (--env development)
      env: {
        NODE_ENV: 'development',
        ENV_PATH: '/home/hltav/rtsmanager_backend/.env',
        FRONTEND_URL: 'http://localhost:3001', // ← Localhost no dev
      },
      // Configuração para PRODUÇÃO (--env production)
      env_production: {
        NODE_ENV: 'production',
        ENV_PATH: '/home/hltav/rtsmanager_backend/.env',
        FRONTEND_URL: 'http://91.99.55.16:3001', // ← IP público no prod
      },
    },
  ],
};
