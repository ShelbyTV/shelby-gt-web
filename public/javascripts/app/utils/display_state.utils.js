libs.shelbyGT.DisplayState = {
  dashboard : 'dashboard',
  rollList : 'rollList',
  standardRoll : 'standardRoll',
  watchLaterRoll : 'watchLaterRoll',
  userPreferences : 'userPreferences',
  none : 'none',
  guideSpinnerOpts : {
    lines: 13, // The number of lines to draw
    length: 7, // The length of each line
    width: 4, // The line thickness
    radius: 10, // The radius of the inner circle
    rotate: 0, // The rotation offset
    color: '#fff', // #rgb or #rrggbb
    speed: 1.7, // Rounds per second
    trail: 60, // Afterglow percentage
    shadow: false, // Whether to render a shadow
    hwaccel: false, // Whether to use hardware acceleration
    className: 'spinner',
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    top: 'auto', // Top position relative to parent in px
    left: 'auto' // Left position relative to parent in px
  }
};
