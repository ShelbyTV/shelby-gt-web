var Bootstrap = {
  initDashboard : function(){
    DataUtils.getDashboardJson(function(data){
      window.Dashboard = new libs.shelbyGT.DashboardModel(data);
      console.log('dashboard', window.Dashboard);
    });
  },
  initRoll : function(){
    DataUtils.getRollJson(function(data){
      var rolls = new libs.shelbyGT.RollsCollection(data);
      console.log('rolls coll', rolls);
    });
  },
  getRollModel : function(i){
    return this.dboard.get('dashboard_entries').at(i).get('frame').get('roll');
  },
  setFirstRollModel : function(cb){
    this.dboard = new libs.shelbyGT.DashboardModel();
    var self = this;
    this.dboard.fetch({success : function (){
      firstRollModel = self.getRollModel(0);
      cb();
    }});
  },
  setupGuideView : function(){
    this.setFirstRollModel(function (){
      guideModel = new libs.shelbyGT.GuideModel({current_roll : firstRollModel});
      guideView = new libs.shelbyGT.GuideView({model:guideModel});
      $(document.body).html(guideView.el);
    });
  },
  goToRoll : function(id){
    shelby.router.navigate('roll/'+id, {trigger:true});
  },
  goToFrameInCurrentRoll : function(id){
    shelby.router.navigate('roll/'+shelby.models.guide.get('contentPaneModel').id+'/frame/'+id, {trigger:false});
  },
  playVideo : function(id){
    shelby.views.displayVideo = new libs.shelbyGT.VideoDisplayView({model:Backbone.Relational.store.find(libs.shelbyGT.VideoModel, id)});
  },
  addMessageToActiveFrame : function(msg){
    var frame = shelby.models.guide.get('activeFrameModel');
    var msg = new libs.shelbyGT.MessageModel({text:msg, conversation_id:frame.get('conversation').id});    
    msg.save(null, {
      success:function(conversation){
        frame.set('conversation', conversation)
      },
      error:function(){
        console.log('err', arguments);
      }
    });
  }
};
