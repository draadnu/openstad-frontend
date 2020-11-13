

module.exports = {
  construct: function(self, options) {


    //console.log('self.newEnv', self.newEnv);
    
    self.prepend('body', function (req) {
      if (req.data.cookieConsent && req.data.global.tagmanager) {
        return '<!-- Google Tag Manager -->' + "\n" +
        '<noscript><iframe src="//www.googletagmanager.com/ns.html?id=' + req.data.global.tagmanager + '" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>' + "\n" +
        '<!-- End Google Tag Manager -->';
      }
      
      return '';
    })
  }
};
