libs.shelbyGT.ListView = Support.CompositeView.extend({

  tagName : 'ul',

  className : 'list',

  /*
    intervalInsertViews - a function that can be overidden by subclasses to return a view or an array of views to add
    to the list and render when this.options.isIntervalComplete returns true

    this option is mutually exclusive with the intervalInsertViewProto option, that is, it will only be used
    if this.options.intervalInsertViewProto is null
    */
  _intervalInsertViews : null,

  /*
    When !insertIntervalViewsIncrementally we insert promos in one shot, each time a new group of list views is added.
    Keeping track of what we've covered so we don't insert promos where they've already been inserted.
  */
  _insertedIntervalsUpToIndex: 0,

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
    
    /* TODO: need documentation on this... */
    comparator : null,
    
    /* TODO: need documentation on these two... */
    doDynamicRender : true,
    doStaticRender : false,
    
    /*
      Where should new listItemViews be rendered?  
      Valid options are 'append' (default), 'prepend', and 'before'.  
      'before' behaves like 'append' but you must also include an element selector (which shoud only
      match one element) that the child is appended just before.
    */
    insert : {
      position : 'append',
      selector : null
    },
    
    /*
      isIntervalComplete - a callback function that can be overriden to return true when client wants
      to insert special view items at certain points in the list, for example:
        function(displayedItems) {
          return displayedItems != 0 && displayedItems % 3 == 0;
        }
      to insert the special view after every three items in the list
    */
    isIntervalComplete : function(displayedItems) {
      return false;
    },
    /*
      intervalInsertViewProto - the view to be inserted when isIntervalComplete returns true
    */
    intervalInsertViewProto : null,
    /*
     * If your item views are not rendered in natural order, make this false.
     * It indicates we need to insert interval views for the group of item views as a whole, not individually.
     */
    insertIntervalViewsIncrementally : true,
    
    /*
      listItemView - a factory method for creating the view for each individual list item given its model
      this can be either:
        1) a string referring to a member of libs.shelbyGT that contains a prototype for a View class
        2) a callback of the form function(item, params) which creates and returns a view, where
          item is the model for the view to be created
          params are any additional parameters to be passed to the new view's constructor
    */
    listItemView : 'ListItemView',
    /*
      listItemViewAdditionalParams - additional parameters to pass to the constructors of the listItemViews
        this can be an object or a function that returns an object
    */
    listItemViewAdditionalParams : {},
    masterCollection : null,
    displayCollection : null,
    simulateAddTrue : true,
    maxDisplayedItems : null // can be null or an integer 1 to infinity
  },
  
  initialize : function(){
    if (this.options.doDynamicRender) {
      if (this.options.collection) {
        this.options.collection.bind('add', this.sourceAddOne, this);
        this.options.collection.bind('destroy', this.sourceRemoveOne, this);
        this.options.collection.bind('reset', this.sourceReset, this);
      } else {
        this.model.bind('add:'+this.options.collectionAttribute, this.sourceAddOne, this);
        this.model.bind('remove:'+this.options.collectionAttribute, this.sourceRemoveOne, this);
      }
    }

    if (!this.options.collection && this.options.simulateAddTrue) {
      if (this.options.masterCollection) {
        this._attachMasterCollection();
      } else {
        this._prepareMasterCollection();
      }
    }

    if (this.options.displayCollection) {
      this._displayCollection = this.options.displayCollection;
    } else {
      this._displayCollection = new Backbone.Collection();
    }
 
    if (this.options.comparator) {
      this._displayCollection.comparator = this.options.comparator;
    }
    
    if(this.model){
      this.model.bind(libs.shelbyGT.ShelbyBaseModel.prototype.messages.fetchComplete, this._onFetchComplete, this);
    }

    this._displayCollection.bind('add', this.internalAddOne, this);
    this._displayCollection.bind('remove', this.internalRemoveOne, this);
    this._displayCollection.bind('reset', this.internalReset, this);
    this._listItemViews = [];
    this._intervalViews = [];
  },

  _cleanup : function(){
    if (this.options.doDynamicRender) {
      if (this.options.collection) {
        this.options.collection.unbind('add', this.sourceAddOne, this);
        this.options.collection.unbind('destroy', this.sourceRemoveOne, this);
        this.options.collection.unbind('reset', this.sourceReset, this);
      } else {
        this.model.unbind('add:'+this.options.collectionAttribute, this.sourceAddOne, this);
        this.model.unbind('remove:'+this.options.collectionAttribute, this.sourceRemoveOne, this);
      }
    }
    
    if(this.model){
      this.model.unbind(libs.shelbyGT.ShelbyBaseModel.prototype.messages.fetchComplete, this._onFetchComplete, this);
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
        newContents = sourceCollection.filter(this._filter, this);
      } else {
        newContents = sourceCollection.models;
      }
      if (this.options.maxDisplayedItems) {
        newContents = newContents.slice(0, this.options.maxDisplayedItems);
      }
      this._displayCollection.reset(newContents);
    }
  },

  _attachMasterCollection : function() {
    this._simulatedMasterCollection = this.options.masterCollection;
    if (this.options.comparator) {
      this._simulatedMasterCollection.comparator = this.options.comparator;
    }
    if (!this.options.doStaticRender) {
      this._simulatedMasterCollection.reset();
    }
  },

  _prepareMasterCollection : function() {
    this._simulatedMasterCollection = new Backbone.Collection();
    if (this.options.comparator) {
      this._simulatedMasterCollection.comparator = this.options.comparator;
    }
    if (this.options.doStaticRender) {
      this._simulatedMasterCollection.reset(this.model.get(this.options.collectionAttribute).models);
    }
  },

  sourceAddOne : function(item, collection, options){
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
    var newContents = sourceCollection.models;
    if (this.options.maxDisplayedItems) {
        newContents = newContents.slice(0, this.options.maxDisplayedItems);
    }
    this._displayCollection.reset(newContents);
  },

  internalRemoveOne : function(item){
    var viewToRemove = _(this._listItemViews).find(function(listItemView) {
      return listItemView.isMyModel(item);
    });
    if (viewToRemove) {
      viewToRemove.leave();
      var index = this._listItemViews.indexOf(viewToRemove);
      if (index > -1) {
        this._listItemViews.splice(index,1);
      }
    }
  },

  internalAddOne : function(item, collection, options){
    var self = this;
    var childView = this._constructListItemView(item);

    //special handling if the item was not added to the end of the collection
    if (options && _(options).has('index') && options.index != this._listItemViews.length) {
      this._listItemViews.splice(options.index, 0, childView);
      // adjusting for size of _intervalViews b/c DOM has views from both _intervalViews and _listItemViews
      this.insertChildAt(childView, options.index+this._intervalViews.length);
    } else {
      //store a reference to all list item child views so they can be removed/left without
      //removing any other child views
      this._listItemViews.push(childView);
      this._insertChildView(childView);
    }

    // If item views are simply appended in natural order, we can simply append our interval view when appropriate
    if(this.options.insertIntervalViewsIncrementally && this.options.isIntervalComplete(this._listItemViews.length)){
      this._insertIntervalViews(null);
    }
  },
  
  /*
   * When our item views are not simply appended in natural order, we can't simply append the interval views.
   *
   * We need to insert interval views for the group of item views as a whole, not individually.  So, when the model
   * has finished fetching and adding/rendering, we do a sweep and insert interval views at that time.
   */
  _insertIntervalViewsForGroup: function(){
    if(this.options.insertIntervalViewsIncrementally){ return; }
    
    //check for promo insertion from end of last group to end of this group
    for(var i = this._insertedIntervalsUpToIndex; i < this._listItemViews.length; ++i){
      if(this.options.isIntervalComplete(i+1)){
        // adjusting for size of _intervalViews b/c DOM has views from both _intervalViews and _listItemViews
        this._insertIntervalViews(i+1+this._intervalViews.length);
      }
    }
    this._insertedIntervalsUpToIndex = this._listItemViews.length;
  },
  
  _insertIntervalViews: function(loc){
    var intervalViews = [];
    if (this.options.intervalInsertViewProto) {
      intervalViews = [new this.options.intervalInsertViewProto()];
    } else if (this._intervalInsertViews) {
      intervalViews = this._intervalInsertViews();
      if (!_(intervalViews).isArray()) {
        intervalViews = [intervalViews];
      }
    }
    _(intervalViews).each(function(intervalView) {
      this._intervalViews.push(intervalView);
      if(typeof(loc) === "number"){
        this.insertChildAt(intervalView, loc++);
      } else {
        this._insertChildView(intervalView);
      }
    }, this);
  },

  _insertChildView: function(childView) {
    if (this.options.insert && this.options.insert.position) {
        switch (this.options.insert.position) {
          case 'append' :
            this.appendChild(childView);
            return;
          case 'prepend' :
            this.prependChild(childView, false);
            return;
          case 'before' :
            if (this.options.insert.selector) {
              this.insertChildBefore(childView, this.options.insert.selector);
              return;
            }
        }
      }

      // default behavior if no options were supplied
      this.appendChild(childView);
  },

  internalReset : function(models){
    var self = this;
    //we have to completely repopulate the contents of the view, so remove
    //all the existing list items
    _(this._listItemViews).each(function(view) {
        view.leave();
    });
    this._listItemViews.length = 0;
    _(this._intervalViews).each(function(view) {
        view.leave();
    });
    this._intervalViews.length = 0;
    //refill the view with the new contents
    models.each(function(item){
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

  _constructListItemView : function(item){
    var params = _(this.options).result('listItemViewAdditionalParams');
    if (typeof this.options.listItemView === 'function'){
      return this.options.listItemView(item, params);
    } else {
      return new libs.shelbyGT[this.options.listItemView](_(params).extend({model:item}));
    }
  },
  
  _onFetchComplete : function(){
    this._insertIntervalViewsForGroup();
  }

});
