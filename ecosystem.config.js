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
        FRONTEND_URL: 'https://localhost:3001',
      },
      // Configuração para PRODUÇÃO (--env production)
      env_production: {
        NODE_ENV: 'production',
        FRONTEND_URL: 'https://rtsportsmanager.com/',
        MAIL_FROM: 'Contato RT Sports Manager <contato@rtsportsmanager.com>',
      },
    },
  ],
  env_file: '.env',
};
