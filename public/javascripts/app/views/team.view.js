libs.shelbyGT.TeamView = Support.CompositeView.extend({

	events : {
		"click .js-about-nav-item" : "_scrollToElement"
	},
  
  template : function(obj){
    return JST['team'](obj);
  },

  render : function(){
    this.$el.html(this.template({user:this.model}));
  },

//un-DRY: duplication in help.view.js
  _scrollToElement : function(e){
    e.preventDefault();
  	$('#js-guide-wrapper').scrollTo(
  			$(e.currentTarget.hash.replace('#','.')),
  			{
					duration : 200, 
					axis : 'y', 
					offset : { top : -10 }
				}
		);
  }

});