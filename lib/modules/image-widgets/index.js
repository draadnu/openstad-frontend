const styleSchema = require('../../../config/styleSchema.js').default;

module.exports = {
  extend: 'openstad-widgets',
  name: 'image',
  label: 'Image',
  addFields: [
    {
      name: 'uploadedImage',
      type: 'attachment',
      label: 'Image',
      required: true,
      trash: true,
      svgImages: true
    },
    {
      name: 'uploadedImageTitle',
      type: 'text',
      label: 'Image title',
      type: 'string'
    },
    {
      name: 'uploadedImageAlt',
      type: 'text',
      label: 'Textual alternative',
      type: 'string'
    },
    {
      name: 'link',
      type: 'boolean',
      label: 'make the image clickable',
      def: false,
      choices: [
        {
          value: true,
          label: "Yes",
          showFields: [
            'imageLink',
            'imageTarget',
          ]
        },
        {
          value: false,
          label: "No"
        },
      ]
    },
    {
      name: 'imageLink',
      type: 'string',
      label: 'Image link'
    },
    {
      name: 'imageTarget',
      type: 'select',
      label: 'imageTarget',
      choices: [
        {
          label: '_blank',
          value: '_blank'
        },
        {
          label: '_self',
          value: '_self',
        },
        {
          label: '_parent',
          value: '_parent',
        },
        {
          label: '_top',
          value: '_top',
        },
      ]
    },
    styleSchema.definition('imageStyles', 'Styles for the image'),

  ],
  construct: function(self, options) {
    const superLoad = self.load;
    self.load = function (req, widgets, callback) {
        widgets.forEach((widget) => {
          if (widget.imageStyles) {
            const imageId = styleSchema.generateId();
            widget.imageId = imageId;
            widget.formattedImageStyles = styleSchema.format(imageId, widget.imageStyles);
          }
        });
      return superLoad(req, widgets, callback);
    };
  }
}
