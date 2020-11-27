const styleSchema = require('../../../config/styleSchema.js').default;
const rp          = require('request-promise');

module.exports = {
  extend:    'openstad-widgets',
  label:     'Text counter',
  addFields: [
    {
      name:     'text',
      type:     'string',
      label:    'Text',
      help:     'Insert text to be shown here, use {count} to replace with the correct count',
      required: true
    },
    {
      name:     'emptyText',
      type:     'string',
      label:    'Text when empty',
      help:     'Insert text to be shown here when count is 0',
      required: true
    },
    {
      name:    'countField',
      type:    'select',
      label:   'Select which type of count to display',
      choices: [
        {
          label: 'Ideas',
          value: 'ideas'
        },
        {
          label:      'Submissions',
          value:      'submissions',
          showFields: ['submissionForm']
        }
      ],
    },
    {
      name:  'submissionForm',
      type:  'string',
      label: 'Submission form ID'
    },
    styleSchema.definition('containerStyles', 'CSS for the button')
  ],
  construct: function (self, options) {
    const superLoad = self.load;
    self.load       = (req, widgets, callback) => {
      widgets.forEach((widget) => {
        if (widget.containerStyles) {
          const containerId               = styleSchema.generateId();
          widget.containerId              = containerId;
          widget.formattedContainerStyles = styleSchema.format(containerId, widget.containerStyles);
        }
        
        widget.displayText = widget.emptyText;
        
        if (widget.countField == 'ideas') {
          if (req && req.data && req.data.ideas && req.data.ideas.length) {
            widget.displayText = widget.text.replace('{count}', req.data.ideas.length);
          } else {
            widget.displayText = widget.emptyText;
          }
        } else if (widget.countField == 'submissions' && widget.submissionForm) {
          const apiUrl = process.env.API;
          const url    = apiUrl + '/api/site/' + req.data.global.siteId + '/submission/' + encodeURIComponent(widget.submissionForm) + '/count';
          
          const headers = {
            'Accept': 'application/json',
          };
          var options   = {
            uri:     url,
            headers: headers,
            json:    true // Automatically parses the JSON string in the response
          };
          
          rp(options).then(function (res) {
            if (res.count && res.count > 0) {
              widget.displayText = widget.text.replace('{count}', res.count);
            } else {
              widget.displayText = widget.emptyText;
            }
          }).catch(function (err) {
            console.log('fetch submission count err', url, err);
            widget.displayText = widget.emptyText;
          });
          
          widget.displayText = 'submission ' + widget.submissionForm;
        }
        
      });
      
      return superLoad(req, widgets, callback);
    }
    
    var superPushAssets = self.pushAssets;
    self.pushAssets     = function () {
      superPushAssets();
      self.pushAsset('stylesheet', 'main', {when: 'always'});
    };
  }
};
