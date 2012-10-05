libs.utils.UniqueCollection = Backbone.Collection.extend({

  initialize : function(models, options) {
    // default options
    this.options = _.chain({}).extend(options).defaults({
      uniquenessValue : function(item) {
        return item;
      },
      maxDisplayedItems : null
    }).value();
  },

  add : function(models, options) {
    models = _.isArray(models) ? models.slice() : [models];
    models = _(models).chain().uniq(false,this.options.uniquenessValue).reject(this._collectionContainsItem, this).value();
    if (this.options.maxDisplayedItems) {
      models = models.slice(0, this.options.maxDisplayedItems);
    }
    Backbone.Collection.prototype.add.call(this, models, options);
  },

  _collectionContainsItem : function(item) {
    var self = this;
    return this.any(function(itemToCompare){
      return self.options.uniquenessValue(itemToCompare) == self.options.uniquenessValue(item);
    });
  }

});
