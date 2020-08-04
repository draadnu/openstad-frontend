const rp            = require('request-promise');
const proxy         = require('http-proxy-middleware');
const url           = require('url');
const request       = require('request');
const pick          = require('lodash/pick')
const eventEmitter  = require('../../../events').emitter;

const resourcesSchema = require('../../../config/resources.js').schemaFormat;
const openstadMap = require('../../../config/map').default;

const toSqlDatetime = (inputDate) => {
    const date = new Date()
    const dateWithOffest = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
    return dateWithOffest
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ')
}

const fields = require('./lib/fields.js');

module.exports = {
  extend: 'map-widgets',
  label: 'Resource form',
  addFields: fields,
  beforeConstruct: function(self, options) {

    if (options.resources) {
      self.resources = options.resources;

      options.addFields = [
        {
          type: 'select',
          name: 'resource',
          label: 'Resource (from config)',
          choices : options.resources
        }
      ].concat(options.addFields || [])
    }
  },
  construct: function(self, options) {

   options.arrangeFields = (options.arrangeFields || []).concat([

     {
       name: 'general',
       label: 'Algemeen',
       fields: ['resource', 'redirect', 'redirectSave', 'preFormText', 'formType', 'dynamicFormSections']
     },
     {
       name: 'title',
       label: 'Title',
       fields: ['labelTitle', 'infoTitle', 'requiredTitle', 'minTitle', 'maxTitle']
     },
     {
       name: 'summary',
       label: 'Summary',
       fields: ['labelSummary', 'infoSummary', 'requiredSummary', 'typeSummary', 'minSummary', 'maxSummary']
     },
     {
       name: 'description',
       label: 'Description',
       fields: ['labelDescription', 'infoDescription', 'editorDescription', 'requiredDescription', 'minDescription', 'maxDescription']
     },
     {
       name: 'images',
       label: 'Images Upload',
       fields: ['labelImages', 'infoImages', 'uploadMultiple', 'requiredImages']
     },
     {
       name: 'themes',
       label: 'Themes',
       fields: ['labelThemes', 'infoThemes', 'requiredThemes']
     },
     {
       name: 'areas',
       label: 'Areas',
       fields: ['labelAreas', 'infoAreas', 'requiredAreas']
     },
     {
       name: 'location',
       label: 'Location',
       fields: ['labelLocation', 'infoLocation', 'displayLocation', 'requiredLocation']
     },
     {
         name: 'Estimate',
         label: 'Estimate costs',
         fields: ['labelEstimate', 'infoEstimate', 'displayEstimate', 'requiredEstimate', 'typeEstimate', 'minEstimate', 'maxEstimate']
     },
     {
         name: 'Role',
         label: 'Role',
         fields: ['labelRole', 'infoRole', 'displayRole', 'requiredRole', 'typeRole', 'minRole', 'maxRole']
     },
     {
         name: 'Phone',
         label: 'Phone number',
         fields: ['labelPhone', 'infoPhone', 'displayPhone', 'requiredPhone', 'minPhone', 'maxPhone']
     },
     {
       name: 'advice',
       label: 'Tip',
       fields: ['labelAdvice', 'infoAdvice', 'displayAdvice', 'requiredAdvice', 'minAdvice', 'maxAdvice']
     },
     {
       name: 'submitting',
       label: 'Submitting',
       fields: ['buttonTextSubmit', 'buttonTextSave']
     },
     {
       name: 'budget',
       label: 'Budget',
       fields: ['displayBudget']
     }

   ]);

    /**
     * Create route for proxying multiples images to image server, add api token in header
     */
    const imageApiUrl   = process.env.IMAGE_API_URL;
    const imageApiToken = process.env.IMAGE_API_ACCESS_TOKEN;
    /**
     * Create route for proxying one image to image server, add api token in header
     */
    self.apos.app.use('/image', proxy({
      target: imageApiUrl,
      changeOrigin: true,
      onProxyReq : (proxyReq, req, res) => {
        // add custom header to request
        proxyReq.setHeader('Authorization', `Bearer ${imageApiToken}`);
      }
    }));

    self.apos.app.use('/file', proxy({
      target: imageApiUrl,
      changeOrigin: true,
      onProxyReq : (proxyReq, req, res) => {
        // add custom header to request
        proxyReq.setHeader('Authorization', `Bearer ${imageApiToken}`);
      }
    }));
    
    /**
     * Create route for proxying one image to image server, add api token in header
     */
    self.apos.app.use('/files', proxy({
      target: imageApiUrl,
      changeOrigin: true,
      onProxyReq : (proxyReq, req, res) => {
        // add custom header to request
        proxyReq.setHeader('Authorization', `Bearer ${imageApiToken}`);
      }
    }));

    /**
     * Create route for proxying multiples images to image server, add api token in header
     */
    self.apos.app.use('/images', proxy({
      target: imageApiUrl,
      changeOrigin: true,
      onProxyReq : (proxyReq, req, res) => {
        // add custom header to request
        proxyReq.setHeader('Authorization', `Bearer ${imageApiToken}`);
      }
    }));

    /**
     * Create route for fetching images by GET from the server
     */
    self.apos.app.use('/fetch-image', (req, res, next) => {
      const imageUrl = req.query.img;
      request.get(imageUrl).pipe(res);
    });

   require('./lib/submit.js')(self, options);

    /** add config **/
    const superLoad = self.load;

    self.load = function(req, widgets, next) {
        const styles = openstadMap.defaults.styles;
        const globalData = req.data.global;

	      widgets.forEach((widget) => {
            const resourceType = widget.resource;
            const resourceInfo = resourcesSchema.find((resourceInfo) => resourceInfo.value === resourceType);
            const resourceConfigKey = resourceInfo ? resourceInfo.configKey : false;
            const resourceConfig = req.data.global.siteConfig && req.data.global.siteConfig[resourceConfigKey] ? req.data.global.siteConfig[resourceConfigKey] : {};

	          const siteConfig = req.data.global.siteConfig;

            widget.resourceConfig = {
              titleMinLength: ( resourceConfig.titleMinLength ) || 0,
              titleMaxLength: ( resourceConfig.titleMaxLength ) || 50,
              summaryMinLength: ( resourceConfig.summaryMinLength ) || 20,
              summaryMaxLength: ( resourceConfig.summaryMaxLength ) || 140,
              descriptionMinLength: ( resourceConfig.descriptionMinLength ) || 0,
              descriptionMaxLength: ( resourceConfig.descriptionMaxLength ) || 5000,
            }

            widget.resourceEndPoint = resourceInfo.resourceEndPoint;

    				widget.siteConfig = {
    					openstadMap: {
    						polygon: ( siteConfig && siteConfig.openstadMap && siteConfig.openstadMap.polygon ) || undefined,
    					},
    				}

    				const markerStyle = siteConfig.openStadMap && siteConfig.openStadMap.markerStyle ? siteConfig.openStadMap.markerStyle : null;

            // Todo: refactor this to get resourceId in a different way
    				const activeResource = req.data.activeResource;

    				const resources = activeResource ? [activeResource] : [];

            widget.mapConfig = self.getMapConfigBuilder(globalData)
                .setDefaultSettings({
                    mapCenterLat: (activeResource && activeResource.location && activeResource.location.coordinates && activeResource.location.coordinates[0]) || globalData.mapCenterLat,
                    mapCenterLng: (activeResource && activeResource.location && activeResource.location.coordinates && activeResource.location.coordinates[1]) || globalData.mapCenterLng,
                    mapZoomLevel: 13,
                    zoomControl: true,
                    disableDefaultUI : true,
                    styles: styles
                })
                .setMarkersByIdeas(resources)
                .setMarkerStyle(markerStyle)
                .setEditorMarker()
                .setEditorMarkerElement('locationField')
                .setPolygon(req.data.global.mapPolygons || null)
                .getConfig()
          
            widget.loginUrl = '/oauth/login?returnTo=' + encodeURI(req.absoluteUrl);
            
            widget.sortedAreas = req.data.global.areas.sort((a, b) => {
              if (a.value < b.value) {
                return -1;
              }
              
              if (a.value > b.value) {
                return 1;
              }
              
              return 0;
            });
  		});

			superLoad(req, widgets, next);
		}



  const superPushAssets = self.pushAssets;
   self.pushAssets = function () {
     superPushAssets();
     self.pushAsset('stylesheet', 'filepond', { when: 'always' });
     self.pushAsset('stylesheet', 'trix', { when: 'always' });
     self.pushAsset('stylesheet', 'form', { when: 'always' });
     self.pushAsset('stylesheet', 'main', { when: 'always' });
     self.pushAsset('script', 'map', { when: 'always' });
     self.pushAsset('script', 'editor', { when: 'always' });


     self.pushAsset('script', 'main', { when: 'always' });
     self.pushAsset('script', 'delete-form', { when: 'always' });
     self.pushAsset('script', 'status-form', { when: 'always' });

     //because of size load in directly in template for now, in future we might consider loading them in user script
     //and load the user script also when users log in via openstad.
     //self.pushAsset('script', 'filepond', { when: 'always' });
     // self.pushAsset('script', 'trix', { when: 'always' });
   };
 }

};
