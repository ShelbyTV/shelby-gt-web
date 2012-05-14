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
      // only thing needed here is msg
      return this.$el.html(this.template({msg:this._educationMsgMap[this.options.type]}));
    },

    _educationMsgMap : {
      'rollList' : 'These are <b>Rolls.</b>  People post video in them.',
      'dashboard' : '<b>Stream</b> shows all the videos from your <b>Rolls</b>',
      'standardRoll' : 'Try <b>hearting</b> the second video in this Roll',
      'watchLaterRoll' : 'Use <b>saves</a> for "watch later" or to remember your favorites.'
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
