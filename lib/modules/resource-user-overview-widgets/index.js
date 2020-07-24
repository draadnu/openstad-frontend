const rp  = require('request-promise');

module.exports = {
  label: 'User Ideas',
  extend: 'idea-overview-widgets',
  construct: function (self, options) {

    self.getIdeas = async (req) => {
      const globalData = req.data.global;
      const apiUrl = self.apos.settings.getOption(req, 'apiUrl');

      const headers = {
        'Accept': 'application/json',
      };

      if (req.session.jwt) {
        headers[""] = `Bearer ${req.session.jwt}`;
      }

      var options = {
        uri: `${apiUrl}/api/site/${globalData.siteId}/idea/user?includeUser=1&includeVoteCount=1&includeUserVote=1&includeArguments=1`,
        headers: headers,
        json: true // Automatically parses the JSON string in the response
      };

      return rp(options);
    };
  },
};
