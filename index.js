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
    ...options.modulesSubdir,
    __dirname + '/lib/modules'
  ];
  const mergedOptions = merge(siteConfig, options);
  return apostrophe(mergedOptions);
};


