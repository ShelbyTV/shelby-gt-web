var Bootstrap = {
  initDashboard : function(){
    DataUtils.getDashboardJson(function(data){
      window.Dashboard = new DashboardModel(data);   
      console.log('dashboard', window.Dashboard);
    });
  },
  initRoll : function(){
    DataUtils.getRollJson(function(data){
      var rolls = new RollsCollection(data);
      console.log('rolls coll', rolls);
    });
  },
  initApp : function(){
    this.dboard = new DashboardModel();
    this.dboard.fetch();
    app = new AppModel({dashboard : this.dboard});
    return app;
  },
  getRollModel : function(i){
    return this.dboard.get('dashboard_entries').at(i).get('frame').get('roll');
  },
  setFirstRollModel : function(cb){
    this.dboard = new DashboardModel();
    var self = this;
    this.dboard.fetch({success : function (){
      firstRollModel = self.getRollModel(0);
      cb();
    }});
  },
  setupGuideView : function(){
    this.setFirstRollModel(function (){
      guideModel = new GuideModel({current_roll : firstRollModel});
      guideView = new GuideView({model:guideModel});
      $(document.body).html(guideView.el);
    });
  },
  goToRoll : function(id){
    shelby.router.navigate('/rolls/'+id, {trigger:true});
  },
  goToFrameInCurrentRoll : function(id){
    shelby.router.navigate('/rolls/'+shelby.models.guide.get('contentPaneModel').id+'/frame/'+id, {trigger:false});
  },
  playVideo : function(id){
    shelby.views.displayVideo = new window.libs.shelbyGT.VideoDisplayView({model:Backbone.Relational.store.find(VideoModel, id)});
  },
};
