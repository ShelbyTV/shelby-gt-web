libs.shelbyGT.PlaybackEventModelTypes = {
  popup : 1,
  concertInfo: 2
};

libs.shelbyGT.PopupEventThemes = {
  basic : 1,
  meme : 2,
  stickyNote : 3
};

libs.shelbyGT.PlaybackEventModel = libs.shelbyGT.ShelbyBaseModel.extend({
  defaults : {
    concert_query : null,
    end_time : 0,
    event_type: libs.shelbyGT.PlaybackEventModelTypes.popup,
    html : '',
    start_time : 0,
    theme: libs.shelbyGT.PopupEventThemes.basic,
    recurring : false,
    recur_interval : 0 // in milliseconds
  }
});