const sortingOptions = require('../../../config/sorting.js').options;
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
const fields           = require('./lib/fields.js');

module.exports = {
  extend:    'apostrophe-widgets',
  label:     'Begroot',
  addFields: fields,
  construct: function (self, options) {

    require('./lib/browser.js')(self, options);

    options.arrangeFields = (options.arrangeFields || []).concat([
      {
        name: 'sorting',
        label: 'Sorting & filtering',
        fields: ['enableSorting', 'selectedSorting','defaultSorting', 'filters', 'busyStatusFilterLabel', 'showIdeasByStatus' ]
      },
    ]);

    const superLoad = self.load;
    self.load = function (req, widgets, next) {
      widgets.forEach((widget) => {
        widget.ideas = req.data.ideas ? req.data.ideas : [];

        // Todo: get env var from map widget config.
        widget.mapType = process.env.MAP_TYPE;
      });

      return superLoad(req, widgets, next);
    }


    const superOutput = self.output;
    self.output = function (widget, options) {
      // add the label to the select sort options for displaying in the select box
      widget.selectedSorting = widget.selectedSorting ? widget.selectedSorting.map((sortingValue) => {
        const sortingOption = sortingOptions.find(sortingOption => sortingOption.value === sortingValue);
        return {
          value: sortingValue,
          label: sortingOption ? sortingOption.label : sortingValue
        }
      }) : [];

      widget.formatImageUrl = function (url, width, height, crop, location) {
        if (url) {
          //url = url + '/:/rs=w:' + width + ',h:' + height;
          //url = crop ? url + ';cp=w:' + width + ',h:' + height : url;
        } else if (location) {
          url = `https://maps.googleapis.com/maps/api/streetview?size=${width}x${height}&location=${location.coordinates[0]},${location.coordinates[1]}&heading=151.78&key=${googleMapsApiKey}`;
        } else {
          url = '/img/placeholders/idea.jpg';
        }

        return url;
      }

      widget.showFilter = (name) => {
        return (widget.filters || []).some(filter => filter === name);
      };

      widget.hasFilter = () => {
        return (widget.filters || []).length > 0;
      };

      if ((widget.showIdeasByStatus|| []).length > 0) {
        widget.ideas = widget.ideas.filter(idea => widget.showIdeasByStatus.some(status => status === idea.status));
      }

      widget.userHasVoted   = false;
      widget.userIsLoggedIn = false;
      return superOutput(widget, options);
    };
  }
};
