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
    var dboard = new DashboardModel();
    dboard.fetch();
    app = new AppModel({dashboard : dboard});
    return app;
  },
  getFirstRollModel : function(dboard){
    return dboard.get('dashboard_entries').at(0).get('frame').get('roll');
  },
  setFirstRollModel : function(){
    dboard = new DashboardModel();
    var self = this;
    dboard.fetch({success : function (){
      firstRollModel = self.getFirstRollModel(dboard);
    }});
  }
};
