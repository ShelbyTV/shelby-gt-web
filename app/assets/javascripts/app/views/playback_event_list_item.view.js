libs.shelbyGT.PlaybackEventListItemView = libs.shelbyGT.ListItemView.extend({
  
  events : {

  },
    
  template: function(obj){
    return SHELBYJST['popup-event-item'](obj);
  },
  
  render: function(){
    this.$el.html(this.template({
      event : this.model,
      index : this.options.index
    }));
  },

  saveFormDataToModel: function() {
    this.model.set({
      end_time : libs.utils.Time.HMStoS(+this.$('#end-hours-' + this.options.index).val(), +this.$('#end-minutes-' + this.options.index).val(), +this.$('#end-seconds-' + this.options.index).val()),
      html : this.$('.js-event-html').val(),
      start_time : libs.utils.Time.HMStoS(+this.$('#start-hours-' + this.options.index).val(), +this.$('#start-minutes-' + this.options.index).val(), +this.$('#start-seconds-' + this.options.index).val())
    });
  }
  
});