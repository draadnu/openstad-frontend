const styleSchema = require('../../../config/styleSchema.js').default;

module.exports = {
  extend: 'apostrophe-widgets',
  label: 'CTA buttons under map',
  addFields: [
    {
      type: 'string',
      label: 'Text for scroll button',
      name: 'scrollButtonText'
    },
    {
      type: 'string',
      label: 'Text for plan entry button',
      name: 'submitPlanText'
    },
    {
      type: 'string',
      label: 'Plan entry page URL',
      name: 'planEntryUrl',
      def: '/plan-indienen'
    },
    styleSchema.definition('containerStyles', 'CSS for the CTA buttons')
  ],
  construct: function(self, options) {
    const superLoad = self.load;
    self.load = (req, widgets, callback) => {
      widgets.forEach((widget) => {
        if (widget.containerStyles) {
          const containerId = styleSchema.generateId();
          widget.containerId = containerId;
          widget.formattedContainerStyles = styleSchema.format(containerId, widget.containerStyles);
        }
      });

      return superLoad(req, widgets, callback);
    }

     var superPushAssets = self.pushAssets;
     self.pushAssets = function() {
       superPushAssets();
       self.pushAsset('stylesheet', 'main', { when: 'always' });
       self.pushAsset('script', 'main', { when: 'always' });
     };
  }
};
