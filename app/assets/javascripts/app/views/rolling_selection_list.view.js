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
    
    className: "rolls-list rolling__roll-selection-list",
    
    initialize : function(){
      var self = this;
      this.options.listItemView = function(item, params){
        return new RollingSelectionItemView(_(params).extend({model:item}));
      };
      ListView.prototype.initialize.call(this);
    },

    _filter : function(roll) {
      return roll.isPostableBy(shelby.models.user);
    },

    _cleanup : function(){
      ListView.prototype._cleanup.call(this);
    },

    render : function(){
      this._leaveChildren();
      ListView.prototype.render.call(this);
    },

    selectRoll : function(roll){
      this.parent.selectRoll(roll);
    }

  });

} ) ();
