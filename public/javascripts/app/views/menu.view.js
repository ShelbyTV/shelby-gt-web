( function(){

  // shorten names of included library prototypes
  var RollHeaderView = libs.shelbyGT.RollHeaderView;
  var FilterControlsView = libs.shelbyGT.FilterControlsView;
  var AnonGuideView = libs.shelbyGT.AnonGuideView;

  libs.shelbyGT.MenuView = Support.CompositeView.extend({

    events : {
      "click .stream" : "_goToStream",
      "click .rolls" : "_goToRolls",
      "click .saves" : "_goToSaves"
    },

    el : '.menu',

    template : function(obj){
      return JST['menu'](obj);
    },

    initialize : function(){
      this.render();
    },

    render : function(active){
      console.log('rendering menu');
      this.$el.html(this.template());
      this.renderChild(new RollHeaderView({model:this.model}));
      this.renderChild(new FilterControlsView({model:this.model}));
      //shelby.models.user.get('anon') && this.renderChild(new AnonGuideView({model:this.model}));
    },

    _goToStream : function(){
      shelby.router.navigate('/', {trigger:true});
    },

    _goToRolls : function(){
      shelby.router.navigate('/rolls', {trigger:true});
    },

    _goToSaves : function(){
      shelby.router.navigate('/saves', {trigger:true});
    }

  });

} ) ();
