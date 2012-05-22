libs.shelbyGT.ListView = Support.CompositeView.extend({

  tagName : 'ul',

  className : 'list',

  /*
    The source data for the list view can come from either a standard Backbone collection
    or a collection (created by a Relation) that is an attribute of a Relational model

    Specify a standard backbone collection by creating the list view as follows:

    listView = new ListView({collection:someBackboneCollection});

    Specify a collection that is an attribute of a Relational model as follows:

    listView = new ListView({model:someRelationalModel, collectionAttribute:'someAttributeName'});

    NOTE: If both collection and collectionAttribute are specified, collection will take precedence.
  */

  options : {
    simulateAddTrue : true,
    collection : null,
    collectionAttribute : 'listCollection',
    listItemView : 'libs.shelbyGT.ListItemView',
    insert : {
      position : 'append',
      selector : null
    }
  },
  
  initialize : function(){
    if (this.options.collection) {
      this.options.collection.bind('add', this.sourceAddOne, this);
      this.options.collection.bind('remove', this.sourceRemoveOne, this);
      this.options.collection.bind('reset', this.sourceReset, this);
    } else {
      this.model.bind('add:'+this.options.collectionAttribute, this.sourceAddOne, this);
      this.model.bind('remove:'+this.options.collectionAttribute, this.sourceRemoveOne, this);
      if (this.options.simulateAddTrue) {
        this._simulatedMasterCollection = new Backbone.Collection();
      }
    }
    this._displayCollection = new Backbone.Collection();
    this._displayCollection.bind('add', this.internalAddOne, this);
    this._displayCollection.bind('reset', this.internalReset, this);
    this._initializeEducation();
  },

  _cleanup : function(){
    if (this.options.collection) {
      this.options.collection.unbind('add', this.sourceAddOne, this);
      this.options.collection.unbind('remove', this.sourceRemoveOne, this);
      this.options.collection.unbind('reset', this.sourceReset, this);
    } else {
      this.model.unbind('add:'+this.options.collectionAttribute, this.sourceAddOne, this);
      this.model.unbind('remove:'+this.options.collectionAttribute, this.sourceRemoveOne, this);
    }
    this._displayCollection.unbind('add', this.internalAddOne, this);
    this._displayCollection.unbind('reset', this.internalReset, this);
  },

  _initializeEducation : function(){
    var self = this;
    if (!this._userHasBeenEducated()){
      setTimeout(function(){
        self._renderEducation();
      }, self._educationTimeoutMap[shelby.models.guide.get('displayState')]);
    }

  },

  _userHasBeenEducated : function(){
    return shelby.models.user.get('app_progress').get(shelby.models.guide.get('displayState')+'Educated');
  },

  // delay before displaying education view
  _educationTimeoutMap : {
    'rollList' : 1000,
    'browseRollList' : 1000,
    'dashboard' : 2000,
    'standardRoll' : 2000,
    'watchLaterRoll' : 1000
  },

  _renderEducation : function(){
    var educationView = new libs.shelbyGT.GuideEducationView({model:shelby.models.user.get('app_progress'), type:shelby.models.guide.get('displayState')});
    this.prependChild(educationView, 'slideToggle');
  },


  _displayListEducationView : function(){
    console.log('_displayListEducationView', arguments);
  },

  sourceAddOne : function(item){
    if (!this._filter || this._filter(item)) {
      this._displayCollection.add(item);
    }
    // there's no way to effectively specify add:true for a Backbone Relational collection
    // we can simulate it by storing all of the contents the relational collection ever loaded,
    // and using this as a surrogate for the relational collection itself when re-filtering
    if (!this.options.collection && this.options.simulateAddTrue) {
      this._simulatedMasterCollection.add(item);
    }
  },

  sourceRemoveOne : function(item){
    var viewToRemove = this.children.find(this._findViewByModel(item));
    if (viewToRemove) {
      viewToRemove.leave();
    }
  },

  sourceReset : function(sourceCollection){
    //only happens when our source collection is a standard backbone collection
    //and not a collection inside a Relational Model
    this._displayCollection.reset(sourceCollection.models);
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
    this._displayCollection.each(function(item){
      self.internalAddOne(item);
    });
  },

  // sub-classes override for custom filtering
  // this should be a function that returns true to include item in the list view, otherwise false
  _filter : null,

  // can also update the filter dynamically at run-time
  updateFilter : function(filterFunction) {
    this._filter = filterFunction;
    if (this._displayCollection) {
      var sourceCollection;
      if (this.options.collection) {
        sourceCollection = this.options.collection;
      } else {
        // if we're re-filtering we need to start with the full contents of the source collection
        // In Backbone Relational, these get overwritten with each progressive-loading fetch, so we
        // have the option of keeping a full copy of the collection within this list view as our "master copy"
        // to revert to before changing the filter
        sourceCollection = this.options.simulateAddTrue ? this._simulatedMasterCollection : this.model.get(this.options.collectionAttribute);
      }
      var newContents;
      if (filterFunction) {
        newContents = sourceCollection.filter(filterFunction);
      } else {
        newContents = sourceCollection.models;
      }
      this._displayCollection.reset(newContents);
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
