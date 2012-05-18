( function(){

  // shorten names of included library prototypes
  var ListView = libs.shelbyGT.ListView;
  var RollingSelectionItemView = libs.shelbyGT.RollingSelectionItemView;
  var RollModel = libs.shelbyGT.RollModel;

  libs.shelbyGT.RollingSelectionListView = ListView.extend({

    events : {
      "click .js-new-public-roll"  : "_rollToNewPublicRoll",
      "click .js-new-private-roll" : "_rollToNewPrivateRoll"
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
      this.parent.revealFrameRollingCompletionView(this.options.frame, null, {type:'public'});
    },

    _rollToNewPrivateRoll : function(){
      this.parent.revealFrameRollingCompletionView(this.options.frame, null, {type:'private'});
    },

    //override of ListView._renderEducation
    _renderEducation : function(){
      // do nothing, we don't want education in this particular list view
    }

  });

} ) ();
