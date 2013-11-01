shelby.config.recommendations = {
  displaySettings : {},
  limits : {
    firstPage : '3,5,2',
    morePages : '4,6'
  },
  sources : {
    firstPage : '31,33,34',
    morePages : '31,33'
  },
  videoGraph : {
    dashboardScanLimit : 20,
    minScore : 40.0
  }
};

shelby.config.recommendations.displaySettings[libs.shelbyGT.DashboardEntryModel.ENTRY_TYPES.entertainmentGraphRecommendation] = {
  avatar : '/images/recommendations/share-1.jpg',
  color  : 'green',
  header : 'Recommended for you'
};

shelby.config.recommendations.displaySettings[libs.shelbyGT.DashboardEntryModel.ENTRY_TYPES.videoGraphRecommendation] = {
  avatar : '/images/recommendations/share-2.jpg',
  color  : 'green',
  header : 'Recommended for you'
};

shelby.config.recommendations.displaySettings[libs.shelbyGT.DashboardEntryModel.ENTRY_TYPES.mortarRecommendation] = {
  avatar : '/images/recommendations/share-2.jpg',
  color  : 'green',
  header : 'Recommended for you'
};

shelby.config.recommendations.displaySettings[libs.shelbyGT.DashboardEntryModel.ENTRY_TYPES.channelRecommendation] = {
    color  : 'green'
};

shelby.config.recommendations.displaySettings[libs.shelbyGT.DashboardEntryModel.ENTRY_TYPES.likeRecommendation] = {
  avatar : '/images/recommendations/like.jpg',
  color  : 'red',
  header : 'Recommended for you'
};