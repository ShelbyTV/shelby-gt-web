libs.shelbyGT.OnboardingFollowSourcesView = Support.CompositeView.extend({

  _page  : 1,
  _limit : 10,
  _pages : null,
  _averagePages : null,
  _sourcesList : '.js-list-sources',


  events : {
    "click .js-onboarding-roll-button:not(.js-busy)" : "_follow",
    "click .js-onboarding-advance-stage"             : "_onAdvanceStage",
    "click .js-see-more"                             : "_showMoreSources"
  },

  template : function(obj){
    return SHELBYJST['onboarding/onboarding-follow-sources'](obj);
  },

  initialize : function(){
    this.options.rollCategories.fetch();

    this.model.bind('change:rolls_followed', this._onRollsFollwedChange, this);
    this.options.rollCategories.get('roll_categories').bind('reset', this.render, this);
  },

  cleanup : function(){
    this.model.unbind('change:rolls_followed', this._onRollsFollwedChange, this);
    this.options.rollCategories.get('roll_categories').unbind('reset', this.render, this);
  },

  render : function(){
    var _rollCategories = [];
    if (this.options.rollCategories && this.options.rollCategories.get('roll_categories').models.length > 0 && this.options.rollCategories.get('roll_categories').models[0].has('rolls')){
      _rollCategories = this.options.rollCategories.get('roll_categories').models[0].get('rolls').models;
    }

    this.$el.html(this.template({rollCategories: _rollCategories}));

    this._pages = this.$el.find(this._sourcesList).children().length;

    return this;
  },

  _onRollsFollwedChange : function(model, rolls_followed){
    var $button = this.$('.js-onboarding-advance-stage');

    if (rolls_followed > 2){
      $button.text('Start Watching')
             .toggleClass('disabled',false)
             .removeAttr('disabled');
    } else {
      var needToFollowCount = 3 - rolls_followed;
      var newText = 'Follow '+(needToFollowCount) + ' More';

      $button.text(newText);
    }
  },

  _follow : function(e){
    // even though the inverse action is now described by the button,
    // we prevent click handling with class js-busy
    var $thisButton = $(e.currentTarget).addClass('js-busy');;

    // immediately toggle the button - if the ajax fails, we'll update the next time we render
    var isFollowed = $thisButton.text('Following').toggleClass('button_enabled visuallydisabled').hasClass('visuallydisabled');
    var notFollowed = !isFollowed;

    var thisRoll = new libs.shelbyGT.RollModel({id: $thisButton.data('roll_id')});

    thisRoll.joinRoll(clearBusyFunction, clearBusyFunction);
  },

  _onAdvanceStage : function(e){
// event tracking
    shelby.trackEx({
      providers : ['ga', 'kmq'],
      gaCategory : "Onboarding",
      gaAction : 'Step 4 Complete',
      gaLabel : shelby.models.user.get('nickname'),
      gaValue : this.model.get('rolls_followed'),
      kmqName : "Onboarding Step 4 Complete",
      kmqProperties : {
        nickname: shelby.models.user.get('nickname'),
        rollsFollowed : this.model.get('rolls_followed')
      }
    });
  },

  _showMoreSources : function(e){
    e.preventDefault();

    var $listItems = this.$el.find(this._sourcesList).children();

    var scope = this._page * this._limit;
    $listItems.slice(scope, (scope + this._limit) ).removeClass('hide');

    this._page += 1;

    this._averagePages = (this._pages / this._limit);

    if(this._page >= this._averagePages) {
      $(e.currentTarget).addClass('hidden');
    }

  }
});
