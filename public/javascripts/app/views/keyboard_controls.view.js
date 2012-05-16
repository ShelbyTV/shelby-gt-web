(function(){

  libs.shelbyGT.KeyboardControlsView = Backbone.View.extend({

    events : {
      "focus input"    : "_onTypeableFocus",
      "focus textarea" : "_onTypeableFocus",
      "blur input"     : "_onTypeableBlur",
      "blur textarea"  : "_onTypeableBlur"
    },

    el : 'body',

    _keyCodeActionMap : {

      // Space Bar (32)
      32 : {
        model : 'userDesires',
        attr : 'playbackStatus',
        val : function(){
          var playbackState = shelby.models.playbackState.get('activePlayerState');
          return playbackState.get('playbackStatus') === 'playing' ?
          libs.shelbyGT.PlaybackStatus.paused :
          libs.shelbyGT.PlaybackStatus.playing;
        }
      },
      
      192 : {
        model : 'userDesires',
        attr : 'guideShown',
        val : function(){
          return !shelby.models.userDesires.get('guideShown');
        }
      },

      77 : {
        model : 'userDesires',
        attr : 'mute',
        val : function(){
          return !shelby.models.userDesires.get('mute');
        }
      }

    },
    
    initialize : function(){
      shelby.models.userDesires.bind('change:typing', function(){
        console.log('typing changed', arguments);
      });
      this._setupKeyboardBindings();
      this._disableSpacebarScrolling();
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
        shelby.models[actionData.model].set(actionData.attr, actionData.val);
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
