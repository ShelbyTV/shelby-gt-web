libs.shelbyGT.PlaybackEventModelTypes = {
  popup : 1
};

libs.shelbyGT.PlaybackEventModel = libs.shelbyGT.ShelbyBaseModel.extend({
  defaults : {
    end_time : 0,
    event_type: libs.shelbyGT.PlaybackEventModelTypes.popup,
    html : '',
    start_time : 0,
    theme: null
  }
});