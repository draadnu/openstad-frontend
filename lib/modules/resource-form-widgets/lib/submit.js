const rp = require('request-promise');
const eventEmitter  = require('../../../../events').emitter;

module.exports = async function(self, options) {


  // Almost identical  to proxy,
  // Server side validation is done by the API
  // In future form can probably talk directly with api proxy,
  // Only images need to be refactored
  self.route('post', 'submit', function(req, res) {
    // emit event
    eventEmitter.emit('resourceCrud');

    /**
     * Format API Url
     */
    const apiUrl = self.apos.settings.getOption(req, 'apiUrl');
    const siteId = req.data.global.siteId;
    const postUrl = `${apiUrl}/api/site/${siteId}/${req.body.resourceEndPoint}`;

    /**
     * Format header
     */
    const httpHeaders = {
        'Accept': 'application/json',
        "X-Authorization" : `Bearer ${req.session.jwt}`,
    };
    
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
          //res.redirect(req.header('Referer') || '/');
       })
       .catch(function (err) {
         res.status(500).json(JSON.stringify(err));

        //req.flash('error', { msg: 'Status niet aangepast!'});
         //return res.redirect(req.header('Referer') || '/');
       });



     } else if (req.body.action && req.body.action === 'DELETE') {
       rp({
           method: 'DELETE',
           uri: `${postUrl}/${req.body.ideaId}`,
           headers: httpHeaders,
           json: true // Automatically parses the JSON string in the response
       })
       .then(function (response) {
        //  req.flash('success', { msg: 'Verwijderd!'});
        //  res.redirect('/');
          res.setHeader('Content-Type', 'application/json');

          res.end(JSON.stringify({
            id: response.id
          }));
       })
       .catch(function (err) {
          // req.flash('error', { msg: 'Er ging iets mis met verwijderen'});
          // return res.redirect(req.header('Referer')  || appUrl);
          rp({
             method: 'DELETE',
             uri: `${postUrl}/${req.body.ideaId}/user`,
             headers: httpHeaders,
             json: true // Automatically parses the JSON string in the response
         })
         .then(function (response) {
          //  req.flash('success', { msg: 'Verwijderd!'});
          //  res.redirect('/');
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

       });
     } else {
  
      const data = req.body;
  
      //format image
      if (data.files) {
    
        Object.keys(data.files).forEach((key) => {
          // when only one image filepondjs sadly just returns object, not array with one file,
          // to make it consistent we turn it into an array
          let files = data.files[key] && typeof data.files[key] === 'string' ? [data.files[key]] : data.files[key];
      
          // format images
      
          files = files ? files.map(function (file) {
            files = JSON.parse(file);
            return files ? files.url : '';
          }) : [];
      
          // add the formatedd images
          data.extraData      = data.extraData ? data.extraData : {};
          data.extraData[key] = files;
        });
    
    
        //clean up data object
        delete data.files;
      }
  
      //format image
      if (data.image) {
        // when only one image filepondjs sadly just returns object, not array with one file,
        // to make it consistent we turn it into an array
        let images = data.image && typeof data.image === 'string' ? [data.image] : data.image;
    
        // format images
        images = images ? images.map(function (image) {
          image = JSON.parse(image);
          return image ? image.url : '';
        }) : [];
    
        // add the formatedd images
        data.extraData        = data.extraData ? data.extraData : {};
        data.extraData.images = images;
    
        //clean up data object
        delete data.image;
      }
  
      //data.status = data.status === 'Opslaan' ? 'DRAFT' : 'OPEN';
  
      let resourceUrl = '';
  
      if (req.body.resourceId) {
        resourceUrl = `${postUrl}/${req.body.resourceId}`;
      }
  
      console.log(req.body.resourceId);
  
      const options = {
        method:  req.body.resourceId ? 'PUT' : 'POST',
        uri:     req.body.resourceId ? resourceUrl : postUrl,
        headers: httpHeaders,
        body:    data,
        json:    true // Automatically parses the JSON string in the response
      };
  
      // todo: dit moet gefixt worden zodat het werkt voor fase 1 en voor de uitslag
      delete data.status;
      
      rp(options)
        .then(function (response) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
                                   id: response.id
                                 }));
        })
        .catch(function (err) {
          console.log('err', err);
      
          res.setHeader('Content-Type', 'application/json');
          res.status(500).end(JSON.stringify({
                                               msg: err.error[0]
                                             }));
        });
  
    }
  });
  
}
