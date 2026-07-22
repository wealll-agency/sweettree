module.exports = {
  apps: [
    {
      name: 'sweettree-backend',
      script: './backend/src/server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 7050
      },
      error_file: './logs/backend-err.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z'
    },
    {
      name: 'sweettree-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 7051',
      cwd: './frontend',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      env_production: {
        NODE_ENV: 'production',
        PORT: 7051
      },
      error_file: './logs/frontend-err.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z'
    }
  ]
};
