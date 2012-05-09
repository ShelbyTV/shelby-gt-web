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
      'rollList' : 'A roll is a living group of videos. Most of the rolls you see here automatically collect what each of your friends share--but I also added a few I like. You can leave a roll at any time, or create your own. Just click the film tape icon on any video to get started.',
      'dashboard' : 'Your stream shows the videos your friends are sharing.',
      'standardRoll' : 'This is what a roll of videos looks like. You can tweet/post/etc. any of these videos, or save them to a personal roll by clicking the blue film tape icon.',
      'watchLaterRoll' : 'If you click the purple "save" icon on any video, I\'ll keep it here for you.'  
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
