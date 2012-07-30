(function(){

  var ScrollingGuideView = libs.shelbyGT.ScrollingGuideView;
  libs.shelbyGT.TeamView = ScrollingGuideView.extend({
    
    template : function(obj){
      return JST['team'](obj);
    }

  });
})();
