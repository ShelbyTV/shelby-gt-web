/*
 * Shows the header image, when available.
 * Maintains the current header image when roll is changed if there is no new header image.
 *
 * If you're looking for the full app width header (which supports multi roll selection) 
 * see IsoRollAppHeaderView rendered via dynamic.router.js
 */
libs.shelbyGT.IsoRollHeaderView = Support.CompositeView.extend({

  className : 'guide-header-wrapper clearfix',

  template : function(obj){
    return SHELBYJST['iso-roll-header'](obj);
  },

  initialize : function(){
    this.model.bind('change', this._onRollChange, this);
  },

  _cleanup : function(){
    this.model.unbind('change', this._onRollChange, this);
  },

  render : function(){
    this.$el.html(this.template({roll : this.model}));

    shelby.models.guide.trigger('reposition');
  },

  _onRollChange : function(rollModel) {
    var _changedAttrs = _(rollModel.changedAttributes());
    if (_changedAttrs.has('header_image_file_name') && rollModel.get('header_image_file_name')) {
      this.render();
    }
  }

});
