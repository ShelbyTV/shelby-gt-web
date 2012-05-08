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
      'rollList' : 'Here is a list of your rolls. We\'ve created a few to get you started.',
      'dashboard' : 'Your stream is a feed of activity from all your allowed networks.',
      'standardRoll' : 'These are the videos for a single roll.',
      'watchLaterRoll' : 'If you clicked the "saves" icon on a particular video, it gets saved here!'  
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
