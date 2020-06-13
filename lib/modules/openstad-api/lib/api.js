const request = require('request-promise');

module.exports = (self, options) => {

  self.init = (req) => {
    const siteConfig = self.apos.settings.getOption(req, 'siteConfig');
    self.siteId = siteConfig.id;
    self.apiUrl = process.env.INTERNAL_API_URL || self.apos.settings.getOption(req, 'apiUrl');
    self.sessionJwt = req.session.jwt;
  };

  self.updateSiteConfig = async (req, siteConfig, item, apiSyncFields) => {

    apiSyncFields.forEach(field => {
      const value = self.getFieldValue(item, field);
      self.setApiConfigValue(siteConfig, field.apiSyncField, value);
    });

    const config = Object.assign({}, siteConfig);
    const areaId = config.area && config.area.id || null;

    // @todo: fix this in a configurable way, currently we add the id, title and area to the siteconfig, and this is a quick and dirty way to not save them to the database
    if (config.id) delete config.id;
    if (config.title) delete config.title;
    if (config.area) delete config.area;

    await self.updateSite({
      id: config.id,
      areaId,
      config
    });

    self.refreshSiteConfig();
  };

  self.refreshSiteConfig = async () => {
    const siteData = await self.getSite();
    self.apos.settings.options.siteConfig = Object.assign(siteData.config, {area: siteData.area});
  };

  self.getOptions = (additionalOptions) => {
    return Object.assign({
      headers: {
        'Accept': 'application/json',
      },
      json: true
    }, additionalOptions);
  };

  self.getOptionsWithAuth = (additionalOptions) => {
    return self.getOptions(Object.assign({
      headers: {
        'Accept': 'application/json',
        'X-Authorization': `Bearer ${self.sessionJwt}`
      }
    }, additionalOptions));
  };

  self.getSite = async (req, siteId, sort) => {
    // FIXME: Create a better way to get the site config or authenticate as a admin
    const options = self.getOptions({
      uri: `${self.apiUrl}/api/site/${self.siteId}`,
      headers: {
        "X-Authorization": process.env.SITE_API_KEY
      }
    });

    return request(options);
  };

  self.getAllIdeas = async (req, siteId, sort) => {
    const options = self.getOptions({
      uri: `${self.apiUrl}/api/site/${siteId}/idea?sort=${sort}&includeVoteCount=1&includeUserVote=1`,
    });

    return request(options);
  };

  self.updateSite = async (data) => {
    const options = self.getOptionsWithAuth({
      method: 'PUT',
      uri: `${self.apiUrl}/api/site/${self.siteId}`,
      body: data,
    });


    return request(options);
  };

  self.getAllPolygons = async () => {
    const options = self.getOptionsWithAuth({
      method: 'GET',
      uri: `${self.apiUrl}/api/area`,
    });

    return request(options);
  }
};
