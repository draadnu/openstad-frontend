require('dotenv').config();

const openstadMap = require('./config/map').default;
const openstadMapPolygons = require('./config/map').polygons;
const apostrophe = require('apostrophe');
const _ = require('lodash');
const defaultSiteConfig = require('./config/siteConfig');
const { readdirSync } = require('fs');

const site = {_id: process.env.SAMPLE_DB};

module.exports.singleSite = function(options) {

  const siteConfig = defaultSiteConfig.get(site, options.projectConfig, openstadMap, openstadMapPolygons);

  siteConfig.modulesSubdir = [
    __dirname + '/lib/modules',
    ...options.modulesSubdir,
  ];

  const mergedOptions = _.merge(siteConfig, options);

  return apostrophe(mergedOptions);
};

module.exports.multiSite = (options) => {

  const multiSite = require('./app.js');

  const app = multiSite.getMultiSiteApp(options);
  app.listen(process.env.PORT);

};

const getDirectories = source => readdirSync(source).filter(name => name.indexOf('apostrophe') <= -1);

module.exports.moogBundle = {
  modules: getDirectories(__dirname + '/lib/modules'),
  directory: 'lib/modules'
};

