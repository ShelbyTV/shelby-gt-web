( function(){

  // shorten names of included library prototypes
  var ListItemView = libs.shelbyGT.ListItemView;

  libs.shelbyGT.ActiveHighlightListItemView = ListItemView.extend({

    // NOTE: you must pass an activationStateModel to this class's constructor
    options : _.extend({}, ListItemView.prototype.options, {
      activationStateModel : null, //the model to listen to for changes in activation state
      activationStateProperty : 'active', //the model property to listen to for changes in activation state
      activeClassName : 'active-list-item' //the class to add to the el when it's activated/highlighted
    }),

    initialize : function(){
      this.options.activationStateModel.bind('change:' + this.options.activationStateProperty, this._checkAndHighlight, this);
      ListItemView.prototype.initialize.call(this);
    },

    _cleanup : function(){
      this.options.activationStateModel.unbind('change:' + this.options.activationStateProperty, this._checkAndHighlight, this);
      this.options.activationStateModel.unbind('change:' + this.options.activationStateProperty, this._checkAndUnHighlight, this);
      ListItemView.prototype._cleanup.call(this);
    },

    render : function(){
      this._checkAndHighlight();
      return this;
    },

    _checkAndHighlight : function(){
      if (this.doActivateThisItem(this.options.activationStateModel)) {
        this._updateHighlight(true);
      }
    },

    _checkAndUnHighlight : function() {
      if (!this.doActivateThisItem(this.options.activationStateModel)) {
        this._updateHighlight(false);
      }
    },

    _updateHighlight : function(doHighlight) {
        this.$el.toggleClass(this.options.activeClassName, doHighlight);
        // bind or unbind handler to remove the active state when this frame is deactivated
        var action = doHighlight ? 'bind' : 'unbind';
        this.options.activationStateModel[action]('change:' + this.options.activationStateProperty, this._checkAndUnHighlight, this);
    },

    doActivateThisItem : function(model) {
      //subclasses must override this function
      //return true or false whether this item should be activated/highlighted based on the
      //changed state in the model
      alert('Your ListItemView subclass must override doActivateThisItem()');
    }

  });

} ) ();