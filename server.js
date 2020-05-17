require('dotenv').config();

const multiSite = require('./app.js');

const app = multiSite.getMultiSiteApp({});
app.listen(process.env.PORT);
