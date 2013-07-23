libs.shelbyGT.SampleDashboardView = Support.CompositeView.extend({

  tagName : 'ul',

  className : 'list',

  template : function(obj){
    return SHELBYJST['sample-dashboard'](obj);
  },

  render : function(){
    this.$el.html(this.template());
  }

});