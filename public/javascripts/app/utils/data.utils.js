var DataUtils = {
  _getData : function(path, cb){
    $.ajax({
      type : 'GET',
      url : 'http://localhost:3001'+path,
      success : function(data){
        cb(JSON.parse(data));
      }
    });
  },
  setRollsJson : function(){
   this._getData('/roll/2.json', function(data){
     window.rollJson = data;
     console.log('done');
   });
  },
  setDashboardJson : function(){
    this._getData('/dashboard.json', function(data){
      window.dbJson = data;
      console.log('done');
    });
  },
  getRollsJson : function(cb){
   this._getData('/roll/2.json', cb);
  },
  getDashboardJson : function(cb){
    this._getData('/dashboard.json', cb);
  }
};
