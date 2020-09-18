module.exports = {
  
  construct: function (self, options) {
    
    const superQuery = self.query;
    
    self.query = function (req, url, options, mainCallback) {
      // Force neverOpenGraph to true to prevent SSRF
      options.neverOpenGraph = true;
      
      superQuery(req, url, options, mainCallback);
    }
  }
  
}
