/*
 * Shows the header image, when available.
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
    this._leaveChildren();

    this.$el.removeAttr('hidden');

    this.$el.html(this.template({roll : this.model}));

    // if user can change the roll header image
    if(this.model.get('creator_id') == shelby.models.user.id){
      this.appendChild(new libs.shelbyGT.HeaderImageUploaderView({model:this.model}));
    }

    shelby.models.guide.trigger('reposition');
  },

  _onRollChange : function(rollModel) {
    var _changedAttrs = _(rollModel.changedAttributes());
    if (_changedAttrs.has('header_image_file_name') || _changedAttrs.has('title') || _changedAttrs.has('frame_count')) {
      this.render();
    }
  }

});
