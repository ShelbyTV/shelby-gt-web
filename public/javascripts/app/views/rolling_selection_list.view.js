( function(){

  // shorten names of included library prototypes
  var ListView = libs.shelbyGT.ListView;
  var RollItemView = libs.shelbyGT.RollItemView;

  libs.shelbyGT.RollingSelectionListView = ListView.extend({

    template : function(obj){
      return JST['roll-selection-items'](obj);
    },

    initialize : function() {
      this.options.collectionAttribute = 'roll_followings';
      this.options.listItemView = 'RollItemView';
      this.options.insert = {
        position : 'before',
        selector : '.js-social'
      };
      ListView.prototype.initialize.call(this);
    },

    _cleanup : function(){
      ListView.prototype._cleanup.call(this);
    },

    render : function() {
      this.$el.html(this.template());
    }

  });

} ) ();
