(function(){

  var _interval = 3*60*1000; //3 mins

  libs.utils.rhombus = _.extend({},libs.utils.rhombus,{
    activity : {
      init_activity : function(){
        setTimeout(this._activity, _interval);
      },

      _activity : function(){
        libs.utils.rhombus.sadd('active_web', shelby.models.user.id);
      }
    }
  });

})();
