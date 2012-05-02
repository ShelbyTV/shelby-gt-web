libs.shelbyGT.TeamView = Support.CompositeView.extend({

	events : {
		"click .js-about-team-employee" : "_scrollToElement"
	},
  
  template : function(obj){
    return JST['team'](obj);
  },

  render : function(){
    this.$el.html(this.template({user:this.model}));
  },

  _scrollToElement : function(e){
  	$('#js-guide-wrapper').scrollTo($(e.currentTarget.hash.replace('#','.')),{duration: 200, axis: 'y', offset:{top: -10}});

  }

});