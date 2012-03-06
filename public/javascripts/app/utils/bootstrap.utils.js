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
    // meaning dashboard and rolls
    DataUtils.getDashboardJson(function(dbJson){
      DataUtils.getRollJson(function(rollsJson){
        var app = new AppModel({dashboard:dbJson, rolls:rollsJson});  
        console.log(app);
      });
    });
  }
};
