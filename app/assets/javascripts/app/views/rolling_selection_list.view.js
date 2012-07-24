( function(){

  // shorten names of included library prototypes
  var ListView = libs.shelbyGT.ListView;
  var RollingSelectionItemView = libs.shelbyGT.RollingSelectionItemView;
  var RollModel = libs.shelbyGT.RollModel;
  var ShareActionState = libs.shelbyGT.ShareActionState;

  libs.shelbyGT.RollingSelectionListView = ListView.extend({

    options : _.extend({}, ListView.prototype.options, {
      collectionAttribute : 'rolls',
      simulateAddTrue : false
    }),
    
    initialize : function(){
      var self = this;
      this.options.listItemView = function(item, params){
        return new RollingSelectionItemView(_(params).extend({model:item,frame:self.options.frame}));
      };
      ListView.prototype.initialize.call(this);
    },

    _filter : function(item) {
      // doesn't make sense to post to my hearts
      if (item.get('roll_type') == libs.shelbyGT.RollModel.TYPES.special_hearted){
        return false;
      }
      // anything I created or is collaborative, I can post to
      if (item.get('creator_id') == shelby.models.user.id || item.get('collaborative')) {
        return true;
      }

      // otherwise, it's non-collaborative and I can't post
      return false;
    },

    _cleanup : function(){
      ListView.prototype._cleanup.call(this);
    },

    render : function(){
      this._leaveChildren();
      ListView.prototype.render.call(this);
    },
    
    rollToExisting : function(frame, roll){
      var self = this;

      this.options.frameRollingState.set({doShare:ShareActionState.share});
      
      // reroll the frame, then show the new frame
      this.options.frame.reRoll(roll, function(newFrame){
        //TODO: show success message?
        self.options.frameRollingState.set({doShare:ShareActionState.complete});
        shelby.router.navigate('roll/'+newFrame.get('roll_id')+'/frame/'+newFrame.id+'?reroll_success=true', {trigger:true});
      });
    },

    //override of ListView._renderEducation
    _renderEducation : function(){
      // do nothing, we don't want education in this particular list view
    }

  });

} ) ();
