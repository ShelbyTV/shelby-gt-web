libs.shelbyGT.ListView = Support.CompositeView.extend({
  
  tagName : 'ul',

  className : 'list',

  options : {
    collectionAttribute : 'listCollection',
    listItemView : 'ListItemView',
    insert : {
      position : 'append',
      selector : null
    }
  },
  
  initialize : function(){
    this.model.bind('add:'+this.options.collectionAttribute, this.addOne, this);
    this.model.bind('remove:'+this.options.collectionAttribute, this.removeOne, this);
    this._initializeEducation();
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
    return shelby.models.user.get('app_progress').get(shelby.models.guide.get('displayState')+'Educated');
  },

  _isEducationDisplayState : function(){
    // if we're rolling a frame, we don't want education
    return shelby.models.user.get('app_progress').get('framesRolled')===0;
  },

  // delay before displaying education view 
  _educationTimeoutMap : {
    'rollList' : 1000,
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

  _cleanup : function(){
    shelby.models.user.get('app_progress').set('framesRolled', 0);
    this.model.unbind('add:'+this.options.collectionAttribute, this.addOne, this);
    this.model.unbind('remove:'+this.options.collectionAttribute, this.removeOne, this);
  },

  addOne : function(item){
    if (!this.filter || this.filter(item)) {
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
    }
  },

  removeOne : function(item){
    var viewToRemove = this.children.find(this._findViewByModel(item));
    if (viewToRemove) {
      viewToRemove.leave();
    }
  },

  // sub-classes override for custom filtering
  // this should be a function that returns true to include item in the list view, otherwise false
  filter : null,

  _findViewByModel : function(model){
    return function(view){
      return view.model == model;
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
