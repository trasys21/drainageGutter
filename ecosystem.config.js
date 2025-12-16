module.exports = {
  apps: [
    {
      name: "drainage-backend",
      script: "server.js",
      cwd: "/home/es-dt23-04/Public/drainageGutter/backend", // ✅ 절대경로
      watch: true,
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      out_file: "/root/.pm2/logs/drainage-backend-out.log",
      error_file: "/root/.pm2/logs/drainage-backend-error.log",
    },
    {
      name: "drainage-frontend",
      script: "npm",
      args: "start",
      cwd: "/home/es-dt23-04/Public/drainageGutter/frontend", // ✅ 이것도 절대경로
      env: {
        NODE_ENV: "development",
      },
    },
  ],
};
