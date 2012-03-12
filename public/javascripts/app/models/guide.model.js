GuideModel = Backbone.Model.extend({
  defaults : {
    'childPane' : DashboardView, 
    'displayedItem' : DashboardModel 
  }
});
