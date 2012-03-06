var Bootstrap = {
  init : function(){
    DataUtils.getDashboardJson(function(data){
      window.Dashboard = new DashboardModel(data);   
      console.log('dashboard', window.Dashboard);
    });
  }
};
