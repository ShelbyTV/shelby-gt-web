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
    collection : null,
    collectionAttribute : 'listCollection',
    doStaticRender : false,
    insert : {
      position : 'append',
      selector : null
    },
    /*
      listItemView - a factory method for creating the view for each individual list item given its model
      this can be either:
        1) a string referring to a member of libs.shelbyGT that contains a prototype for a View class
        2) a callback of the form function(item, params) which creates and returns a view, where
          item is the model for the view to be created
          params are any additional parameters to be passed to the new view's constructor
    */
    listItemView : 'ListItemView',
    masterCollection : null,
    simulateAddTrue : true
  },
  
  initialize : function(){
    if (this.options.collection) {
      this.options.collection.bind('add', this.sourceAddOne, this);
      this.options.collection.bind('destroy', this.sourceRemoveOne, this);
      this.options.collection.bind('reset', this.sourceReset, this);
    } else {
      this.model.bind('add:'+this.options.collectionAttribute, this.sourceAddOne, this);
      this.model.bind('remove:'+this.options.collectionAttribute, this.sourceRemoveOne, this);
      if (this.options.simulateAddTrue) {
        if (this.options.masterCollection && this.options.doStaticRender) {
          this._attachMasterCollection();
        } else {
          this._prepareMasterCollection();
        }
      }
    }
    this._displayCollection = new Backbone.Collection();
    this._displayCollection.bind('add', this.internalAddOne, this);
    this._displayCollection.bind('remove', this.internalRemoveOne, this);
    this._displayCollection.bind('reset', this.internalReset, this);
    this._listItemViews = [];
    this._initializeEducation();
  },

  _cleanup : function(){
    if (this.options.collection) {
      this.options.collection.unbind('add', this.sourceAddOne, this);
      this.options.collection.unbind('destroy', this.sourceRemoveOne, this);
      this.options.collection.unbind('reset', this.sourceReset, this);
    } else {
      this.model.unbind('add:'+this.options.collectionAttribute, this.sourceAddOne, this);
      this.model.unbind('remove:'+this.options.collectionAttribute, this.sourceRemoveOne, this);
    }
    this._displayCollection.unbind('add', this.internalAddOne, this);
    this._displayCollection.unbind('remove', this.internalRemoveOne, this);
    this._displayCollection.unbind('reset', this.internalReset, this);
  },

  render : function(forceReRender){
    if (forceReRender || this.options.doStaticRender) {
      var sourceCollection = this._getSourceCollection();
      var newContents;
      if (this._filter) {
        newContents = sourceCollection.filter(this._filter);
      } else {
        newContents = sourceCollection.models;
      }
      this._displayCollection.reset(newContents);
    }
  },

  _attachMasterCollection : function() {
    this._simulatedMasterCollection = this.options.masterCollection;
  },

  _prepareMasterCollection : function() {
    this._simulatedMasterCollection = new Backbone.Collection();
    if (this.options.doStaticRender) {
      this._simulatedMasterCollection.reset(this.model.get(this.options.collectionAttribute).models);
    }
  },

  _initializeEducation : function(){
    var self = this;
    if (shelby.userSignedIn() && !this._userHasBeenEducated()){
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
    this._displayCollection.remove(item);
    if (!this.options.collection && this.options.simulateAddTrue) {
      this._simulatedMasterCollection.remove(item);
    }
  },

  sourceReset : function(sourceCollection){
    //only happens when our source collection is a standard backbone collection
    //and not a collection inside a Relational Model
    this._displayCollection.reset(sourceCollection.models);
  },

  internalRemoveOne : function(item){
    var viewToRemove = this.children.find(this._findViewByModel(item));
    if (viewToRemove) {
      viewToRemove.leave();
      var index = this._listItemViews.indexOf(viewToRemove);
      if (index > -1) {
        this._listItemViews.splice(index,1);
      }
    }
  },

  internalAddOne : function(item, collection, options){
    var childView = this._constructListItemView(item);

    //special handling if the item was not added to the end of the collection
    if (options && _(options).has('at') && options.at != collection.length) {
      console.log('head insert!!');
      this._listItemViews.splice(options.at, 0, childView);
      this.insertChildAt(childView, options.at);
    } else {
      //store a reference to all list item child views so they can be removed/left without
      //removing any other child views
      this._listItemViews.push(childView);
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
    }
  },

  internalReset : function(){
    var self = this;
    //we have to completely repopulate the contents of the view, so remove
    //all the existing list items
    _(this._listItemViews).each(function(view) {
        view.leave();
    });
    this._listItemViews.length = 0;
    //refill the view with the new contents
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
      this.render(true);
    }
  },

  _getSourceCollection : function() {
    if (this.options.collection) {
        return this.options.collection;
    } else {
        // In Backbone Relational, the source collection contents get overwritten with each progressive-loading fetch,
        // so we have the option of keeping a full copy of the collection within this list view as our "master copy"
        return this.options.simulateAddTrue ? this._simulatedMasterCollection : this.model.get(this.options.collectionAttribute);
    }
  },

  _findViewByModel : function(model){
    return function(view){
      return model && view.model.id == model.id;
    };
  },

  _constructListItemView : function(item){
    var params = _(this).result('_listItemViewAdditionalParams');
    if (typeof this.options.listItemView === 'function'){
      return this.options.listItemView(item, params);
    } else {
      return new libs.shelbyGT[this.options.listItemView](_(params).extend({model:item}));
    }
  },

  // sub-classes override to pass additional parameters to the constructors of the list item views
  // this can be an object or a function that returns an object
  _listItemViewAdditionalParams : {}

});
