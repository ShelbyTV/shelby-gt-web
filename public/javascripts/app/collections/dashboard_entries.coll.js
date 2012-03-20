libs.shelbyGT.DashboardEntriesCollection = Backbone.Collection.extend({

  // Reference to this collection's model.
  model: libs.shelbyGT.DashboardEntryModel,

  // Filter down the list of all todo items that are finished.
  filterBy: function(attr) {
    return this.filter(function(dEntry){ return todo.get(attr); });
  }

});
