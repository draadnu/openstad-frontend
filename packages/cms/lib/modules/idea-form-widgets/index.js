/**
 * Deprecated, see resource form
 */
const rp            = require('request-promise');
const proxy         = require('http-proxy-middleware');
const url           = require('url');
const request       = require('request');
const pick          = require('lodash/pick')
const eventEmitter  = require('../../../events').emitter;
const openstadMap   = require('../../../config/map').default;
const imageApiUrl   = process.env.IMAGE_API_URL;
const imageApiToken = process.env.IMAGE_API_ACCESS_TOKEN;


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
  label: 'Idea form',
  addFields: fields,
  openstadApiConfigSync: true,
  afterConstruct: function(self) {


  },
  construct: function(self, options) {

      options.arrangeFields = (options.arrangeFields || []).concat([
     {
       name: 'general',
       label: 'Algemeen',
       fields: ['redirect', 'formType', 'dynamicFormSections']
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
       name: 'budget',
       label: 'Budget',
       fields: ['displayBudget']
     },
     {
       name: 'submitting',
       label: 'Submitting',
       fields: ['buttonTextSubmit', 'buttonTextSave']
     },
   ]);

    /** add config **/
    const superLoad = self.load;

    self.load = async function(req, widgets, next) {
        const styles = openstadMap.defaults.styles;
        const globalData = req.data.global;


        widgets.forEach(async (widget) => {

	          const siteConfig = req.data.global.siteConfig;
    				widget.siteConfig = {
    					openstadMap: {
    						polygon: ( siteConfig && siteConfig.openstadMap && siteConfig.openstadMap.polygon ) || undefined,
    					},
    				}

    				const markerStyle = siteConfig.openStadMap && siteConfig.openStadMap.markerStyle ? siteConfig.openStadMap.markerStyle : null;

            // Todo: refactor this to get ideaId in a different way
    				const idea = req.data.ideas ? req.data.ideas.find(idea => idea.id === parseInt(req.query.ideaId, 10)) : null;
    				const ideas = idea ? [idea] : [];
            const googleMapsApiKey = self.apos.settings.getOption(req, 'googleMapsApiKey');

            widget.mapConfig = self.getMapConfigBuilder(globalData)
                .setDefaultSettings({
                    mapCenterLat: (idea && idea.location && idea.location.coordinates && idea.location.coordinates[0]) || globalData.mapCenterLat,
                    mapCenterLng: (idea && idea.location && idea.location.coordinates && idea.location.coordinates[1]) || globalData.mapCenterLng,
                    mapZoomLevel: 16,
                    zoomControl: true,
                    googleMapsApiKey: googleMapsApiKey,
                    disableDefaultUI : true,
                    googleMapsApiKey: googleMapsApiKey,
                    styles: styles
                })
                .setMarkersByResources(ideas)
                .setMarkerStyle(markerStyle)
                .setEditorMarker()
                .setEditorMarkerElement('locationField')
                .setPolygon(req.data.global.mapPolygons || null)
                .getConfig()
  		});

			superLoad(req, widgets, next);
		};



  const superPushAssets = self.pushAssets;
   self.pushAssets = function () {
     superPushAssets();

     self.pushAsset('script', 'map', { when: 'always' });
   };


   const imagePath = options.sitePrefix ? ('/' + options.sitePrefix + '/image' ) : '/image'
   const imagesPath = options.sitePrefix ? ('/' + options.sitePrefix + '/images') : '/images'

   /**
    * Create route for proxying one image to image server, add api token in header
    */
   self.apos.app.use('/image', proxy({
     target: imageApiUrl,
     changeOrigin: true,
     pathRewrite: {['^' + imagePath] : '/image'},
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
     pathRewrite: {['^' + imagesPath] : '/images'},
     changeOrigin: true,
     onProxyReq : (proxyReq, req, res) => {
        // add custom header to request
        proxyReq.setHeader('Authorization', `Bearer ${imageApiToken}`);
     }
   }));

   /**
    * Create route for fetching images by GET from the server
    */
   /*self.apos.app.use('/fetch-image', (req, res, next) => {
     const imageUrl = req.query.img;
     request.get(imageUrl).pipe(res);
   });*/

   self.route('post', 'submit', function(req, res) {

     // emit event
     eventEmitter.emit('ideaCrud');

     /**
      * Add CSRF
      */
     const apiUrl = self.apos.settings.getOption(req, 'apiUrl');
     const appUrl = self.apos.settings.getOption(req, 'appUrl');

     const siteId = req.data.global.siteId;
     const postUrl = `${apiUrl}/api/site/${siteId}/idea`;

     const httpHeaders = {
         'Accept': 'application/json',
         "X-Authorization" : `Bearer ${req.session.jwt}`,
     };

     let redirect = req.body.redirect || req.header('Referer');

     if (req.body.action && (req.body.action === 'UPDATE_STATUS' || req.body.action === 'MODBREAK') ) {
       const data = {};

       if (req.body.status) {
         data.status = req.body.status;
       }

       if (req.body.modBreak) {
         var datetime = new Date();

         data.modBreak = req.body.modBreak;
         data.modBreakUserId = req.data.openstadUser.id;
         data.modBreakDate = req.body.modBreakDate ? req.body.modBreakDate : toSqlDatetime();
       }

       rp({
           method: 'PUT',
           uri: `${postUrl}/${req.body.ideaId}`,
           headers: httpHeaders,
           body: data,
           json: true // Automatically parses the JSON string in the response
       })
       .then(function (response) {
          //req.flash('success', { msg: 'Status aangepast!'});
          res.setHeader('Content-Type', 'application/json');

          res.end(JSON.stringify({
            id: response.id
          }));
       })
       .catch(function (err) {
         res.status(500).json(JSON.stringify(err));
       });



     } else if (req.body.action && req.body.action === 'DELETE') {
       rp({
           method: 'DELETE',
           uri: `${postUrl}/${req.body.ideaId}`,
           headers: httpHeaders,
           json: true // Automatically parses the JSON string in the response
       })
       .then(function (response) {
          res.setHeader('Content-Type', 'application/json');

          res.end(JSON.stringify({
            id: response.id
          }));
       })
       .catch(function (err) {
        // req.flash('error', { msg: 'Er ging iets mis met verwijderen'});
        // return res.redirect(req.header('Referer')  || appUrl);
        res.status(500).json(JSON.stringify(err));

       });
     } else {
       // when only one image filepondjs sadly just returns object, not array with one file,
       // to make it consistent we turn it into an array
       req.body.image = req.body.image && typeof req.body.image === 'string' ? [req.body.image] : req.body.image;

       // format images
       const images = req.body.image ? req.body.image.map(function(image) {
         image = JSON.parse(image);
         return image ? image.url : '';
       }) : [];

       const data = {
         title: req.body.title,
         description: req.body.description,
         summary: req.body.summary ? req.body.summary.replace(/(\r\n|\n|\r)/gm, "") : '',
         location: req.body.location,
         tags: req.body.tags
       };

       // get the extra data from the body if set, with pick
       // @todo move to global / api setting.
       data.extraData = pick(req.body, 'theme', 'area', 'advice', 'phone', 'estimate', 'role', 'isOrganiserQuestion', 'isOrganiserName', 'isOrganiserWebsite', 'helpNeededQuestion', 'helpNeededDescription', 'helpNeededApply' , 'isOrganiserPhone', 'isOrganiserEmail', 'vimeoId', 'accessible_location');

       // add the proformatted images
       data.extraData.images = images;

       if (req.data.hasModeratorRights && req.body.modBreak) {
         data.modBreak = req.body.modBreak;
       }

       if (req.data.hasModeratorRights) {
         data.budget = req.body.budget;
       }

       rp({
           method: req.body.ideaId ? 'PUT' : 'POST',
           uri: req.body.ideaId ? `${postUrl}/${req.body.ideaId}` : postUrl,
           headers: httpHeaders,
           body: data,
           json: true // Automatically parses the JSON string in the response
       })
       .then(function (response) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            id: response.id
          }));
       })
       .catch(function (err) {
         res.setHeader('Content-Type', 'application/json');
         res.status(500).end(JSON.stringify({
           msg: err.error[0]
         }));
        // res.redirect(req.header('Referer')  || appUrl);
       });
     }
    // Access req.body here
    // Send back an AJAX response with `res.send()` as you normally do with Express
  });


  }
};
