require('dotenv').config()

module.exports = {
  name: "openstad-frontend",
  script: "../app.js",
  time: true,
  node_args: "--max_old_space_size=4096",
  env: process.env,
  env_production: {
    NODE_ENV: "production",
  }
};
