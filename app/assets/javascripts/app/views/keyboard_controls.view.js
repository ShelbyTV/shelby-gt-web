(function(channels){

  libs.shelbyGT.KeyboardControlsView = Backbone.View.extend({

    events : {
      "focus input"    : "_onTypeableFocus",
      "focus textarea" : "_onTypeableFocus",
      "blur input"     : "_onTypeableBlur",
      "blur textarea"  : "_onTypeableBlur"
    },

    el : 'body',

    _keyCodeActionMap : {

      //  spacebar
      32 : {
        model : 'userDesires',
        attr : 'playbackStatus',
        val : function(){
          var playbackState = shelby.models.playbackState.get('activePlayerState');
          if (playbackState) {
            return playbackState.get('playbackStatus') === 'playing' ?
            libs.shelbyGT.PlaybackStatus.paused :
            libs.shelbyGT.PlaybackStatus.playing;
          } else {
            return false;
          }
        },
        is_transient : true
      },
      // (g)uide
      71 : {
        model : 'userDesires',
        attr : 'guideShown',
        val : function(){
          return !shelby.models.userDesires.get('guideShown');
        }
      },
      // (m)ute
      77 : {
        model : 'userDesires',
        attr : 'mute',
        val : function(){
          return !shelby.models.userDesires.get('mute');
        }
      },
      // (->) right
      39 : {
        model : 'userDesires',
        attr : 'changeVideo',
        val : 1,
        is_transient : true
      },
      // (<-) left
      37 : {
        model : 'userDesires',
        attr : 'changeVideo',
        val : -1,
        is_transient : true
      },
      // up
      38 : {
        model : 'userDesires',
        attr : 'changeChannel',
        val : 1,
        is_transient : true
      },
      // down
      40 : {
        model : 'userDesires',
        attr : 'changeChannel',
        val : -1,
        is_transient : true
      },
      
      // (l)ink
      76 : {
        model : 'userDesires',
        attr : 'shortLink',
        val : function(){
          if (shelby.models.guide.get('activeFrameModel')){
            var _frameId = shelby.models.guide.get('activeFrameModel').id;
            $.ajax({
              url: 'http://api.shelby.tv/v1/frame/'+_frameId+'/short_link',
              dataType: 'json',
              success: function(r){ shelby.alert(r.result.short_link); }
            });
          }
        },
        is_transient : true
      }
    },
    
    initialize : function(channels){
      if (typeof channels !== 'undefined' && channels === true) {
        // hack to know global state, mainly for remote-control-bindings
        window.SHELBY_CHANNEL_HOME = true;
        this._setupChannelCoverKeyboardBindings();
        this._disableSpacebarScrolling();        
      }
      else {
        window.SHELBY_CHANNEL_HOME = false;
        this._setupKeyboardBindings();
        this._disableSpacebarScrolling();        
      }
    },
  
    _disableSpacebarScrolling : function(){
      var self = this;
      $(document).on('keydown', function(e){
        //if we aren't typing
        if (!shelby.models.userDesires.get('typing')){
          // cancel default behavior of space
          return !(e.keyCode == 32);
        }
      });
    },

    _onTypeableFocus : function(){
      shelby.models.userDesires.set('typing', true);
    },

    _onTypeableBlur : function(){
      shelby.models.userDesires.set('typing', false);
    },
    
    _setupKeyboardBindings : function(){
      var self = this;
      $(document).on('keyup', function(event){
        if(shelby.models.userDesires.get('typing')) return false;
        var actionData = self._getActionData(event.keyCode);
        if(!actionData) return false;
        if(!actionData.is_transient){
          shelby.models[actionData.model].set(actionData.attr, actionData.val);
        } else {
          shelby.models[actionData.model].triggerTransientChange(actionData.attr, actionData.val);
        }
        return false;
      });
    },
    
    _setupChannelCoverKeyboardBindings : function() {
      var self = this;
      $(document).on('keyup', function(event){
        if(shelby.models.userDesires.get('typing')) return false;
        var actionData = self._getActionData(event.keyCode);
        var channel;
        if(!actionData) return false;
        // UP
        if (actionData.attr == "changeChannel" && actionData.val == 1){ 
          channel = "entertain";
        }
        // DOWN
        else if (actionData.attr == "changeChannel" && actionData.val == -1){ 
          channel = "teach";          
        }
        // RIGHT
        else if (actionData.attr == "changeVideo" && actionData.val == 1){ 
          channel = "laugh";
        }
        // LEFT
        else if (actionData.attr == "changeVideo" && actionData.val == -1){ 
          channel = "inspire";
        }
        
        $(document).unbind('keyup');
      	shelby.views.keyboardControls = new libs.shelbyGT.KeyboardControlsView(false);
        shelby.router.navigate("channel/"+channel, {trigger: true, replace: true});
        $('body .channel-background').remove();
        return false;
      });      
    },

    _getActionData : function(keyCode){
      var actionDataRaw = _.clone(this._keyCodeActionMap[event.keyCode]);
      if(!actionDataRaw) return false;
      actionDataRaw.val = (typeof actionDataRaw.val === 'function') ? actionDataRaw.val() : actionDataRaw.val;
      return actionDataRaw;
    }

  });
})();
