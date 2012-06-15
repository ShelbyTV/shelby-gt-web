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
