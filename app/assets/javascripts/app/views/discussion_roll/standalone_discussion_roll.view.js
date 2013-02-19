libs.shelbyGT.StandaloneDiscussionRollView = Support.CompositeView.extend({

  events : {
    "click .js-nav" : "showDiscussionRollsManagerView",
  },

  el: '#js-shelby-wrapper',

  initialize : function(){
    //TODO: ideally, the styles applied to 'shelby-wrapper--discussion' should be applied to like... the body -MM
    $('body').addClass('shelby-wrapper--discussion');

    this.model && this.model.on('change:discussion_roll_participants', this._updateRecipientsViews, this);

    this.render();

    //fetch the discussion roll, which all my children are watching
    this.model && this.model.fetch({
      data: {
        limit: 3 // needs to match firstFetchLimit in DiscussionRollConversationView
        },
      success: function(model, resp){
        setTimeout(function(){ $("body").scrollTop(10000000000); }, 200);
        
        //on mobile, hide the header after the user has scrolled
        setTimeout(function(){
          $(document).one("scroll", function(e){
            $('.js-shelby-header').addClass("user-did-scroll");
          });
        }, 2000);
      },
      error: function(a){
        $(".js-discussion-roll-conversation-list").html("<h1>Something went wrong :(</h1><h1>Try reloading...</h1>");
      }
    });

  },

  _cleanup: function(){
    this.model && this.model.off('change:discussion_roll_participants', this._updateRecipientsViews, this);
  },

  template : function(obj){
    return SHELBYJST['discussion-roll/standalone-layout'](obj);
  },

  render : function(){
    this.$el.html(this.template());

    var opts = {model:this.model, viewer:this.options.viewer, token:this.options.token};

    if(this.options.viewer){
      //manager only needs viewr
      this.renderChild(new libs.shelbyGT.DiscussionRollsManagerView(_.extend({delegate:this}, opts)));

      //recipients, conversation, reply require a discusison roll (ie.this.model) and token
      if(this.model && this.options.token){
        this._updateRecipientsViews();
        this.appendChildInto( new libs.shelbyGT.DiscussionRollConversationView(opts),
          ".js-discussion-roll-conversation-wrapper");
        this.renderChild(     new libs.shelbyGT.DiscussionRollReplyView(opts));
      }
    }
  },

  showDiscussionRollsManagerView: function(e){
    e && e.stopPropagation();
    $('.js-discussion-main').toggleClass('hidden',true);
    $('.js-discussion-menu').toggleClass('hidden',false);
  },

  discussionRollsManagerViewShouldDisappear: function(){
    $('.js-discussion-main').toggleClass('hidden',false);
    $('.js-discussion-menu').toggleClass('hidden',true);
  },

  //show single recipient in nav title, or should group in supplementary TO area
  _updateRecipientsViews: function(){
    var self = this;

    if(this.options.viewer && this.model && this.model.has('discussion_roll_participants')){
      this.renderChildInto(new libs.shelbyGT.DiscussionRollRecipientsView(
        _.extend({updatePageTitle:true}, {model:this.model, viewer:this.options.viewer, token:this.options.token})),
        this.$(".js-discussion-roll-recipients"));
    }
  }

});