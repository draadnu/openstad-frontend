require('dotenv').config()

console.log(process.env);

module.exports = {
  name: "openstad-frontend-new",
  script: process.env.PWD + "/app.js",
  time: true,
  node_args: "--max_old_space_size=4096",
  env: {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DEFAULT_HOST:  process.env.DEFAULT_HOST,
    DEFAULT_DB:  process.env.DEFAULT_DB,
    SAMPLE_DB: process.env.SAMPLE_DB,
    APP_URL: process.env.APP_URL,
    API: process.env.API,
    API_LOGOUT_URL:  process.env.API_LOGOUT_URL,
    IMAGE_API_URL:  process.env.IMAGE_API_URL,
    IMAGE_API_ACCESS_TOKEN:  process.env.IMAGE_API_ACCESS_TOKEN,
    SESSION_SECRET:   process.env.SESSION_SECRET,
    SITE_API_KEY:  process.env.SITE_API_KEY,
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY
  },
  env_production: {
    NODE_ENV: "production",
  }
};
