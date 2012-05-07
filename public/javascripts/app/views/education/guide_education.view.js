( function(){

  libs.shelbyGT.GuideEducationView = Support.CompositeView.extend({

    tagName : 'li',

    events : {
      "click .js-guide-education-close" : "_onClickClose"
    },

    template : function(obj){
      return JST['guide-education'](obj);
    },

    className : 'guide-education', 
    
    initialize : function(){
      this.model.bind('change:'+this.options.type+'Educated', this._onEducationStatusChange, this);
      //this.render();
    },

    _cleanup : function(){
      this.model.unbind('change:'+this.options.type+'Educated', this._onEducationStatusChange, this);
    },

    render : function(){
      return this.$el.html(this.template(this.options));
    },

    _onEducationStatusChange : function(userProgressModel, hasBeenEducated){
      if (hasBeenEducated){
        this.$el.slideToggle(50);
      }
    },

    _onClickClose : function(){
      this.model.set(this.options.type+'Educated', true);
    }

  });

} ) ();
