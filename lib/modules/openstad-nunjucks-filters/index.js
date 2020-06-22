const stripTags = require('./stripTags');
const allowedTags = ['<br />', '<a>', '<p>', '<b>', '<br>', '<em>', '<h1>', '<h2>', '<h3>', '<i>', '<strong>', '<b>', '<ul>', '<ol>', '<li>'];

module.exports = {
  construct: function(self, options) {
    self.apos.templates.addFilter('stripSafe', function (s) {
        return s ? stripTags(s, allowedTags.join('')) : '';
    });
  }
};
