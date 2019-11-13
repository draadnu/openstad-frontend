require('dotenv').config({ path: process.cwd() + '/ecosystem/.deploy_env' });
console.log(process.env);
module.exports = {
  apps: [
    require('./app')
  ],
  deploy: {
    staging : {
      "user" : process.env.DEPLOY_USER,
      "host" : process.env.HOST,
      "ref"  : process.env.REF,
      repo : process.env.REPO,
      "path" : process.env.DEPLOY_PATH,
      "post-deploy" : "npm i && pm2 startOrRestart ecosystem/ecosystem.config.js --update-env"
    },
  }
}
