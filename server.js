require('dotenv').config();

const multiSite = require('./app.js');

const app = multiSite.getMultiSiteApp(options);
app.listen(process.env.PORT);
