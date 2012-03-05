// Dashboard Entry Collection
// ---------------

DashboardEntriesCollection = Backbone.Collection.extend({

  // Reference to this collection's model.
  model: DashboardEntryModel, 

  // Filter down the list of all todo items that are finished.
  filterBy: function(attr) {
    return this.filter(function(dEntry){ return todo.get(attr); });
  },

  // Todos are sorted by their original insertion order.
  comparator: function(dEntry) {
    return dEntry.get('rank');
  }

});
