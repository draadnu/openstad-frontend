module.exports = (self, options) => {
  const superPushAssets = self.pushAssets;

  self.pushAssets = () => {
    superPushAssets();

    self.pushAsset('stylesheet', 'main', {when: 'always'});
    self.pushAsset('stylesheet', 'overview', {when: 'always'});
    self.pushAsset('stylesheet', 'steps', {when: 'always'});
    self.pushAsset('stylesheet', 'helpers', {when: 'always'});
    self.pushAsset('stylesheet', 'mobile-accordion', {when: 'always'});
    self.pushAsset('stylesheet', 'end-date-bar', {when: 'always'});
    self.pushAsset('stylesheet', 'budget-block', {when: 'always'});
    self.pushAsset('stylesheet', 'button-vote', {when: 'always'});
    self.pushAsset('stylesheet', 'button-add', {when: 'always'});
    self.pushAsset('stylesheet', 'sticky', {when: 'always'});
    self.pushAsset('stylesheet', 'gridder', {when: 'always'});
    self.pushAsset('stylesheet', 'image-modal', {when: 'always'});

    self.pushAsset('script', 'sticky', {when: 'always'});
    self.pushAsset('script', 'accordion', {when: 'always'});
    self.pushAsset('script', 'jquery.gridder.min', {when: 'always'});
    self.pushAsset('script', 'ideas-lister', {when: 'always'});

    self.pushAsset('script', 'find-polyfill', {when: 'always'});
    self.pushAsset('script', 'voting', {when: 'always'});
    self.pushAsset('script', 'westbegroot-enhancements', {when: 'always'});
    self.pushAsset('script', 'image-modal', {when: 'always'});
  };
};
