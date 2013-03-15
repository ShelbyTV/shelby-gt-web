libs.utils.intercom = {
  boot : function(userModel){
    if(typeof(Intercom) !== "undefined"){
      try {
        created_at = new Date(userModel.get('created_at').slice(0,10));
        created_at = created_at.getTime();
        Intercom('boot', {
                app_id: 'aeb096feb787399ac1cf3985f891d0e13aa47571',
                email: userModel.get('primary_email'),
                created_at: created_at,
                name: userModel.get('name'),
                user_id: userModel.get('id')
              });
      } catch (e) {console.log("[ INTERCOM ERROR ] ", e);}
    }
  }
};
