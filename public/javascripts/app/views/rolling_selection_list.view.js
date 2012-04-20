( function(){

  // shorten names of included library prototypes
  var ListView = libs.shelbyGT.ListView;
  var RollingSelectionItemView = libs.shelbyGT.RollingSelectionItemView;
  var RollModel = libs.shelbyGT.RollModel;

  libs.shelbyGT.RollingSelectionListView = ListView.extend({

    events : {
      "click .js-new-public-roll"  : "_rollToNewPublicRoll",
      "click .js-new-private-roll" : "_rollToNewPrivateRoll",
      "click .js-roll-social"      : "_rollToSocialRoll"
    },

    className : 'form-rolls-list',

    template : function(obj){
      return JST['roll-selection-default-items'](obj);
    },

    initialize : function(){
      var self = this;
      this.options.collectionAttribute = 'roll_followings';
      this.options.listItemView = function(item){
        return new RollingSelectionItemView({model:item,frame:self.options.frame});
      };
      this.options.insert = {
        position : 'before',
        selector : '.js-social'
      };
      ListView.prototype.initialize.call(this);
    },

    filter : function(item) {
      // the user can only post to certain rolls
      if (item.get('creator_id') == shelby.models.user.id) {
        return true;
      }
      if (!item.get('collaborative')) {
        return false;
      }
      if (item.get('public')) {
        return true;
      }

      // if we got here, it's a private collaborative roll that I'm following, so I can post
      return true;
    },

    _cleanup : function(){
      ListView.prototype._cleanup.call(this);
    },

    render : function(){
      this._leaveChildren();
      this.$el.html(this.template());
    },

    _rollToNewPublicRoll : function(){
      this.parent.revealFrameRollingCompletionView(null, this.options.frame, null, {type:'public'});
    },

    _rollToNewPrivateRoll : function(){
      this.parent.revealFrameRollingCompletionView(null, this.options.frame, null, {type:'private'});
    },

    _rollToSocialRoll : function(){
      var self = this;
      var rollFollowings = shelby.models.user.get('roll_followings');
      var socialRoll = rollFollowings.get(shelby.models.user.get('public_roll').id);
      this.options.frame.reRoll(socialRoll, function(newFrame){
        self.parent.revealFrameRollingCompletionView(newFrame, self.options.frame, socialRoll);
      });
    }

  });

} ) ();
