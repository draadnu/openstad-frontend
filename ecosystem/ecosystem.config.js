require('dotenv').config({ path: process.cwd() + '/ecosystem/.deploy_env' });

module.exports = {
  apps: [
    require('./app')
  ],
  deploy: {
    staging : {
      "user" : process.env.USER,
      "host" : process.env.HOST,
      "ref"  : process.env.REF,
      repo : process.env.REPO,
      "path" : process.env.PATH,
      "post-deploy" : "pm2 restart ecosystem.config.js --env staging"
    },
  }
}
