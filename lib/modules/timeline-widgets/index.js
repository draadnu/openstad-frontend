const styleSchema = require('../../../config/styleSchema.js').default;

module.exports = {
  extend: 'apostrophe-widgets',
  label: 'Timeline',

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
     self.pushAssets = () => {
       superPushAssets();
       self.pushAsset('stylesheet', 'main', { when: 'always' });
     };
  }
};
