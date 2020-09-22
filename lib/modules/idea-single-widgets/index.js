const rp = require('request-promise');
const eventEmitter  = require('../../../events').emitter;
const extraFields =  require('../../../config/extraFields.js').fields;
const fields = require('./lib/fields.js');

module.exports = {
  extend: 'map-widgets',
  label: 'Idea single',
  addFields: fields,
  adminOnly: true,
  construct: function(self, options) {
     let classIdeaId;

     require('./lib/routes.js')(self, options);

     const postVote = (req, res, next) => {
      eventEmitter.emit('vote');

       const apiUrl = self.apos.settings.getOption(req, 'apiUrl');
       const siteId = req.data.global.siteId;
       const postUrl = `${apiUrl}/api/site/${siteId}/vote`;
       const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

       let votes = req.body.votes ? req.body.votes : [{
         ideaId: req.body.ideaId,
         opinion: req.body.opinion,
      //   ipOriginXXX: ip // 1111
       }];

       votes = votes.map((vote) => {
         vote.ipOriginXXX = ip;
         return vote;
       })

       const options = {
           method: 'POST',
           uri: postUrl,
           headers: {
               'Accept': 'application/json',
               "X-Authorization" : `Bearer ${req.session.jwt}`,
           },
           body: votes,
           json: true // Automatically parses the JSON string in the response
       };

       rp(options)
        .then(function (response) {
          if (req.redirectUrl) {
            res.redirect(req.redirectUrl);
          } else {
            res.end(JSON.stringify({
              id: response.id
            }));
          }
        })
        .catch(function (err) {
            console.log('===> voting err', err);
            res.status(500).json(err);
         });
     }
     
     self.getUserIdea = require('./../apostrophe-pages/getUserIdea.js')(self);

     const superPushAssets = self.pushAssets;
     self.pushAssets = function () {
       superPushAssets();
       self.pushAsset('stylesheet', 'main', { when: 'always' });
       self.pushAsset('stylesheet', 'secondary', { when: 'always' });
       self.pushAsset('script', 'main', { when: 'always' });
     };

      const superLoad = self.load;
      self.load = async function (req, widgets, next) {
          const styles = self.apos.settings.getOption(req, 'openStadMap').defaults.styles;
          const globalData = req.data.global;
          const siteConfig = req.data.global.siteConfig;
          
          // Todo: refactor this to get ideaId in a different way
          const ideaId = req.url
              .replace(/(\/.*\/)/, '')
              .replace(/\?.*/, '');
          
          let idea = req.data.ideas ? req.data.ideas.find(idea => idea.id === parseInt(ideaId, 10)) : null;
          
          if (!idea) {
            try {
              idea = await self.getUserIdea(req, ideaId);
            } catch (e) {
              idea = null;
            }
          }
          
          const ideas = idea ? [idea] : [];
          
          widgets.forEach((widget) => {
              widget.siteConfig = {
                  minimumYesVotes: (siteConfig && siteConfig.ideas && siteConfig.ideas.minimumYesVotes),
                  voteValues: (siteConfig && siteConfig.votes && siteConfig.votes.voteValues) || [{
                      label: 'voor',
                      value: 'yes',
                      screenReaderAddition: 'dit plan stemmen'
                  }, {label: 'tegen', value: 'no', screenReaderAddition: 'dit plan stemmen'}],
              }
              if (widget.siteConfig.minimumYesVotes == null || typeof widget.siteConfig.minimumYesVotes == 'undefined') widget.siteConfig.minimumYesVotes = 100;

              const markerStyle = siteConfig.openStadMap && siteConfig.openStadMap.markerStyle ? siteConfig.openStadMap.markerStyle : null;

              widget.mapConfig = self.getMapConfigBuilder(globalData)
                  .setDefaultSettings({
                      mapCenterLat: (idea && idea.location && idea.location.coordinates && idea.location.coordinates[0]) || globalData.mapCenterLat,
                      mapCenterLng: (idea && idea.location && idea.location.coordinates && idea.location.coordinates[1]) || globalData.mapCenterLng,
                      mapZoomLevel: 15,
                      zoomControl: true,
                      disableDefaultUI : true,
                      styles: styles
                  })
                  .setMarkersByIdeas(ideas)
                  .setMarkerStyle(markerStyle)
                  .setPolygon(req.data.global.mapPolygons || null)
                  .getConfig()
            
              widget.embeddedVideo = '';
              
              if (idea && idea.extraData && idea.extraData.video) {
                const video = idea.extraData.video;
                
                if (video.includes('youtube.com') && video.includes('v=')) {
                  const regex = /.*\/?.*v\=([^&]+)/igm;
                  const matches = regex.exec(video);
                  
                  if (matches && matches[1]) {
                    widget.embeddedVideo = '<iframe width="560" height="315" src="https://www.youtube.com/embed/' + matches[1] + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
                  }
                } else if (video.includes('vimeo.com')) {
                  const regex = /.*vimeo\.com\/([0-9]+).*/igm;
                  const matches = regex.exec(video);
                  
                  if (matches && matches[1]) {
                    widget.embeddedVideo = '<iframe src="https://player.vimeo.com/video/' + matches[1] + '" width="560" height="315" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>';
                  }
                }
              }
              
              const ideaUrl = req.data.currentUrl;
              
              widget.emailShareBody = `Beste ,\n\nOnlangs hebben wij een initiatief ingediend voor de Energie uit de Wijk Challenge. Wij willen ons initiatief (${ideaUrl}) graag aan je laten zien. We zijn benieuwd wat je ervan vindt.\n\nStemmen\nHet is ook mogelijk om te stemmen op ons initiatief. Klik op de stem-knop op onze initiatievenpagina (${ideaUrl}) om dat te doen. Je hebt nog tot 1 oktober om ons te helpen!\n\nMeehelpen\nWil je ons meehelpen met de uitvoering van ons initiatief? Laat het ons weten via onze initiatievenpagina (${ideaUrl}).\n\nWe hopen dat onze plannen jou ook energie geven om aan de slag te gaan met schone energie.\n\nGroeten,\n\nDe initiatiefnemers`;

          });
          return superLoad(req, widgets, next);
      }

     const superOutput = self.output;
     self.output = function(widget, options) {
       widget.extraFields = extraFields;
       return superOutput(widget, options);
     };

  }
};
