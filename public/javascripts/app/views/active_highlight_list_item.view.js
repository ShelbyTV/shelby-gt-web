( function(){

  // shorten names of included library prototypes
  var ListItemView = libs.shelbyGT.ListItemView;

  libs.shelbyGT.ActiveHighlightListItemView = ListItemView.extend({

    options : _.extend({}, ListItemView.prototype.options, {
      activationStateModel : new Backbone.Model(), //the model to listen to for changes in activation state
      activationStateProperty : 'active', //the model property to listen for changes to
      activeClassName : 'active-list-item' //the class to add to the el when it's activated/highlighted
    }),

    initialize : function(){
      eval(this.options.activationStateModel).bind('change:' + this.options.activationStateProperty, this._checkAndHighlight, this);
      ListItemView.prototype.initialize.call(this);
    },

    _cleanup : function(){
      eval(this.options.activationStateModel).unbind('change:' + this.options.activationStateProperty, this._checkAndHighlight, this);
      eval(this.options.activationStateModel).unbind('change:' + this.options.activationStateProperty, this._onThisItemDeactivate, this);
      ListItemView.prototype._cleanup.call(this);
    },

    render : function(){
      this._checkAndHighlight();
    },

    _checkAndHighlight : function(){
      if (this.doActivateThisItem(eval(this.options.activationStateModel))) {
        this.$el.addClass(this.options.activeClassName);
        //bind a handler to remove the active state when this frame is deactivated
        eval(this.options.activationStateModel).bind('change:' + this.options.activationStateProperty, this._onThisItemDeactivate, this);
      }
    },

    _onThisItemDeactivate : function() {
      this.$el.removeClass(this.options.activeClassName);
      eval(this.options.activationStateModel).unbind('change:' + this.options.activationStateProperty, this._onThisItemDeactivate, this);
    },

    doActivateThisItem : function(model) {
      //subclasses must override this function
      //return true or false whether this item should be activated/highlighted based on the
      //changed state in the model
      alert('Your ListItemView subclass must override doActivateThisItem()');
    }

  });

} ) ();