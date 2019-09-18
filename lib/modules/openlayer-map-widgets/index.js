
module.exports = {
    extend: 'apostrophe-widgets',
    label: 'Openlayer map',
    addFields: [
        {
            name: 'displayCtaButton',
            type: 'boolean',
            label: 'Display CTA button',
            def: true,
            choices: [
                {
                    value: true,
                    label: "Yes",
                    showFields: [
                        'ctaUrl', 'ctaText'
                    ]
                },
                {
                    value: false,
                    label: "No"
                },
            ]
            //  required: true
        },
        {
            name: 'ctaUrl',
            type: 'string',
            label: 'CTA url',
            required: true
        },
        {
            name: 'ctaText',
            type: 'string',
            label: 'CTA text',
            //  required: true
        },
        {
            name: 'displayCounter',
            type: 'boolean',
            label: 'Display counter',
            def: true,
            choices: [
                {
                    value: true,
                    label: "Yes",
                    showFields: [
                        'counterText'
                    ]
                },
                {
                    value: false,
                    label: "No"
                },
            ]
            //  required: true
        },

        {
            name: 'counterText',
            type: 'string',
            label: 'Counter text',
            //  required: true
        },


    ],
    construct: function(self, options) {
        const superPushAssets = self.pushAssets;
        self.pushAssets = function () {
            superPushAssets();
            self.pushAsset('stylesheet', 'main', { when: 'always' });
            //   self.pushAsset('script', 'sticky', { when: 'always' });
        };
    }
};
