module.exports = {
  apps: [{
    name: "rtsmanager",
    script: "./dist/main.js",
    cwd: "/home/hltav/rtsmanager_backend",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production",
      ENV_PATH: "/home/hltav/rtsmanager_backend/.env"
    }
  }]
};