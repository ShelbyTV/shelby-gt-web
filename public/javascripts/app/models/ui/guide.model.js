libs.shelbyGT.GuideModel = Backbone.Model.extend({
  defaults : {
    'contentPaneView' : DashboardView,
    'contentPaneModel' : libs.shelbyGT.DashboardModel,
    'activeFrameModel' : null
  }
});
