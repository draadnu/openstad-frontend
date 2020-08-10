const rp = require('request-promise');

module.exports = function (self) {
  return async (req, ideaId) => {
    
    if (!req.session.jwt || !ideaId) {
      return null;
    }
    
    console.log ('get user idea', ideaId);
    
    const apiUrl = self.apos.settings.getOption(req, 'apiUrl');
    
    const headers = {
      'Accept': 'application/json',
      "X-Authorization": `Bearer ${req.session.jwt}`
    };
    
    var options = {
      uri: `${apiUrl}/api/site/${req.data.global.siteId}/idea/${ideaId}/user?includeUser=1&includeVoteCount=1&includeUserVote=1&includeArguments=1`,
      headers: headers,
      json: true // Automatically parses the JSON string in the response
    };
    
    return rp(options);
  }
}
