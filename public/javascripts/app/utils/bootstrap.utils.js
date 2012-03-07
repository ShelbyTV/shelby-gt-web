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
  setFirstRollModel : function(){
    this.dboard = new DashboardModel();
    var self = this;
    this.dboard.fetch({success : function (){
      firstRollModel = self.getRollModel(0);
    }});
  }
};
