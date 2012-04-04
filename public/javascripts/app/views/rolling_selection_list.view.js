( function(){

  // shorten names of included library prototypes
  var ListView = libs.shelbyGT.ListView;
  var RollSelectionItemView = libs.shelbyGT.RollSelectionItemView;

  libs.shelbyGT.RollingSelectionListView = ListView.extend({

    className : 'form-rolls-list',

    template : function(obj){
      return JST['roll-selection-default-items'](obj);
    },

    initialize : function(){
      var self = this;
      this.options.collectionAttribute = 'roll_followings';
      this.options.listItemView = function(item){
        return new RollSelectionItemView({model:item,frame:self.options.frame});
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
      this.$el.html(this.template());
    }

  });

} ) ();
