GuideModel = Backbone.Model.extend({
  defaults : {
    'contentPaneView' : DashboardView,
    'contentPaneModel' : DashboardModel,
    'activeFrameId' : null
  }
});
