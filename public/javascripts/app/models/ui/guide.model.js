libs.shelbyGT.GuideModel = Backbone.Model.extend({
  defaults : {
    'contentPaneView' : libs.shelbyGT.DashboardView,
    'contentPaneModel' : libs.shelbyGT.DashboardModel,
    'activeFrameModel' : null
  }
});
