const styleSchema = require('../../../config/styleSchema.js').default;

module.exports = {
    extend: 'apostrophe-widgets',
    label: 'Campaign header',
    controls: {
        position: 'bottom-left'
    },
    addFields: [
        {
            name: 'background',
            type: 'attachment',
            label: 'Image',
            required: true,
            trash: true,
            svgImages: true
        },
        {
            name: 'title',
            type: 'string',
            label: 'Titel',
        },
        {
            name: 'subtitle',
            type: 'string',
            label: 'Subtitle',
        },
        {
            name: 'introText',
            type: 'string',
            label: 'Intro text',
        },
        {
            type: 'boolean',
            name: 'showBtnIntro',
            default: true,
            label: 'Show button linking to users plan',
            choices: [
                {
                    value: true,
                    label: "Yes",
                    showFields: [
                        'btn1Label'
                    ]
                },
                {
                    value: false,
                    label: "No"
                },
            ]
        },
        {
            name: 'btn1Label',
            type: 'string',
            label: 'Button label',
        },
        {
            type: 'boolean',
            name: 'showBtn',
            default: true,
            label: 'Show button in right column',
            choices: [
                {
                    value: true,
                    label: "Yes",
                    showFields: [
                        'btnLabel', 'btnUrl', 'btnIcon'
                    ]
                },
                {
                    value: false,
                    label: "No"
                },
            ]
        },
        {
            name: 'btnLabel',
            type: 'string',
            label: 'Button label',
        },
        {
            name: 'btnUrl',
            type: 'string',
            label: 'Button URL',
        },
        {
            name: 'btnIcon',
            type: 'attachment',
            label: 'Image',
            required: true,
            trash: true,
            svgImages: true
        },
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

        const superOutput = self.output;
        self.output = function(widget, options) {
            var count;

            //    console.log('----idget.counterTypes', widget);
            count = widget.ideasCount;

            widget.count = ('000' + count).slice(-3);
            var result = superOutput(widget, options);
            return result;
        };

        var superPushAssets = self.pushAssets;
        self.pushAssets = function() {
            superPushAssets();
            self.pushAsset('stylesheet', 'main', { when: 'always' });
        };
    }
};