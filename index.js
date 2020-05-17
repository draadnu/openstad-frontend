require('dotenv').config();

const openstadMap = require('./config/map').default;
const openstadMapPolygons = require('./config/map').polygons;
const apostrophe = require('apostrophe');
const _ = require('lodash');
const defaultSiteConfig = require('./config/siteConfig');
const site = {_id: process.env.SAMPLE_DB}
const siteConfig = defaultSiteConfig.get(site, {}, openstadMap, openstadMapPolygons);
const merge = require('merge-deep');

module.exports = function(options) {
  siteConfig.modulesSubdir = [
    __dirname + '/lib/modules',
    ...options.modulesSubdir,
  ];
  const mergedOptions = merge(siteConfig, options);
  console.log(mergedOptions);
  return apostrophe(mergedOptions);
};

const { readdirSync } = require('fs')
const { join } = require('path')

const getDirectories = source => readdirSync(source).filter(name => name.indexOf('apostrophe') <= -1);

module.exports.moogBundle = {
  modules: getDirectories(__dirname + '/lib/modules'),
  directory: 'lib/modules'
};

