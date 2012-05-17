libs.shelbyGT.ListView = Support.CompositeView.extend({

  tagName : 'ul',

  className : 'list',

  options : {
    collectionAttribute : 'listCollection',
    listItemView : 'libs.shelbyGT.ListItemView',
    insert : {
      position : 'append',
      selector : null
    }
  },
  
  initialize : function(){
    this.model.bind('add:'+this.options.collectionAttribute, this.relationalAddOne, this);
    this.model.bind('remove:'+this.options.collectionAttribute, this.relationalRemoveOne, this);
    this._internalCollection = new Backbone.Collection();
    this._internalCollection.bind('add', this.internalAddOne, this);
    this._internalCollection.bind('reset', this.internalReset, this);
    this._initializeEducation();
  },

  _cleanup : function(){
    shelby.models.userProgress.set('framesRolled', 0);
    this.model.unbind('add:'+this.options.collectionAttribute, this.relationalAddOne, this);
    this.model.unbind('remove:'+this.options.collectionAttribute, this.relationalRemoveOne, this);
    this._internalCollection.unbind('add', this.internalAddOne, this);
    this._internalCollection.unbind('reset', this.internalReset, this);
  },

  _initializeEducation : function(){
    var self = this;
    if (!this._userHasBeenEducated() && this._isEducationDisplayState()){
      var self = this;
      setTimeout(function(){
        self._renderEducation();
      }, self._educationTimeoutMap[shelby.models.guide.get('displayState')]);
    }

  },

  _userHasBeenEducated : function(){
    return shelby.models.userProgress.get(shelby.models.guide.get('displayState')+'Educated');
  },

  _isEducationDisplayState : function(){
    // if we're rolling a frame, we don't want education
    return shelby.models.userProgress.get('framesRolled')===0;
  },

  // delay before displaying education view 
  _educationTimeoutMap : {
    'rollList' : 1000,
    'dashboard' : 2000,
    'standardRoll' : 2000,
    'watchLaterRoll' : 1000
  },

  _renderEducation : function(){
    var educationView = new libs.shelbyGT.GuideEducationView({model:shelby.models.userProgress, type:shelby.models.guide.get('displayState')});
    this.prependChild(educationView, 'slideToggle');
  },


  _displayListEducationView : function(){
    console.log('_displayListEducationView', arguments);
  },

  relationalAddOne : function(item){
    if (!this._filter || this._filter(item)) {
      this._internalCollection.add(item);
    }
  },

  relationalRemoveOne : function(item){
    var viewToRemove = this.children.find(this._findViewByModel(item));
    if (viewToRemove) {
      viewToRemove.leave();
    }
  },

  internalAddOne : function(item){
    var childView = this._constructListItemView(item);
    if (this.options.insert && this.options.insert.position) {
      switch (this.options.insert.position) {
        case 'append' :
          this.appendChild(childView);
          return;
        case 'before' :
          if (this.options.insert.selector) {
            this.insertChildBefore(childView, this.options.insert.selector);
            return;
          }
      }
    }

    // default behavior if not enough options were supplied
    this.appendChild(childView);
  },

  internalReset : function(){
    var self = this;
    this._leaveChildren();
    this._internalCollection.each(function(item){
      self.internalAddOne(item);
    });
  },

  // sub-classes override for custom filtering
  // this should be a function that returns true to include item in the list view, otherwise false
  _filter : null,

  // can also update the filter dynamically at run-time
  updateFilter : function(filterFunction) {
    this._filter = filterFunction;
    if (this._internalCollection) {
      var newContents;
      if (filterFunction) {
        newContents = this.model.get(this.options.collectionAttribute).filter(filterFunction);
      } else {
        newContents = this.model.get(this.options.collectionAttribute).models;
      }
      this._internalCollection.reset(newContents);
    }
  },

  _findViewByModel : function(model){
    return function(view){
      return model && view.model.id == model.id;
    };
  },

  _constructListItemView : function(item){
    var proto;
    if (typeof this.options.listItemView === 'function'){
      return this.options.listItemView(item);
    } else {
      return new libs.shelbyGT[this.options.listItemView]({model:item});
    }
  }

});
