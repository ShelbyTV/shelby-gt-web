(function(){

  var ScrollingGuideView = libs.shelbyGT.ScrollingGuideView;
  libs.shelbyGT.HelpView = ScrollingGuideView.extend({
    
    template : function(obj){
      return JST['help'](obj);
    }

  });
})();
