libs.shelbyGT.RollHeaderView = Support.CompositeView.extend({

  events : {
    "keypress #js-roll-name-change input" : "_onEnterInInputArea"
  },

  className : 'roll-header clearfix',

  template : function(obj){
    return JST['roll-header'](obj);
  },

  initialize : function(){
    this.model.bind('change:title', this.render, this);
  },

  _cleanup : function(){
    this.model.unbind('change:title', this.render, this);
  },

  render : function(){
    this.$el.html(this.template({roll:this.model,guide:shelby.models.guide}));
  },

  _showRollNameEditInput : function(){
    if (this.model.get('creator_id') == shelby.models.user.id){
      var rollName = this.model.get('title');
      this.$('#js-roll-name-change').show();
      this.$('.roll-title-text').hide();
      this.$('#js-roll-name-change input').focus();
    }
  },

  _onEnterInInputArea : function(){
    if (event.keyCode==13){
      return this._editRollName();
    }
  },

  _editRollName : function(){
    var self = this;
    var _newTitle = this.$('.roll-name-change input').val();
    this.model.save({title: _newTitle});
    $('.js-edit-roll').text('Edit');
    $('.roll-title-text').show();
    $('#js-roll-name-change').hide();
  }

});
