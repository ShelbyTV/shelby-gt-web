( function(){

  // shorten names of included library prototypes
  var ListView = libs.shelbyGT.ListView;
  var RollSelectionItemView = libs.shelbyGT.RollSelectionItemView;

  libs.shelbyGT.RollingSelectionListView = ListView.extend({

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

    _cleanup : function(){
      ListView.prototype._cleanup.call(this);
    },

    render : function(){
      this.$el.html(this.template());
    }

  });

} ) ();
