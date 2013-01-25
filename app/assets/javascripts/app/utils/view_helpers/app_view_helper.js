libs.shelbyGT.viewHelpers.app = {

  //time (ms since epoch) the mongo id was created
  timestampFromMongoId: function(id){
    if(!id){ return 0; }
    return parseInt(id.substr(0,8), 16) * 1000;
  },

  //javascript Date object from mongo id
  dateFromMongoId: function(id){
    return new Date(libs.shelbyGT.viewHelpers.app.timestampFromMongoId(id));
  },

  // return a fuzzy textual date (ie. 1 minute ago, 2 days ago, last week, etc.)
  prettyDate: function(date, format){
    var format = format || "mmm dd, yyyy, h:MM TT";

    var diff = (((new Date()).getTime() - date.getTime()) / 1000),
    day_diff = Math.floor(diff / 86400);

    if ( isNaN(day_diff) ){ return; }

    return day_diff === 0 && (
        diff < 60 && "just now" ||
        diff < 120 && "1 minute ago" ||
        diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
        diff < 7200 && "1 hour ago" ||
        diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
      day_diff < 1 && "just now" ||
      day_diff == 1 && "yesterday" ||
      day_diff < 7 && day_diff + " days ago" ||
      day_diff < 14 && "last week" ||
      day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago" ||
      day_diff >= 31 && date.format(format);
  },

  // return a concise and accurate date (ie. 2:48 PM (if it's today), Yesterday, Monday (if within a week), or actual date like 1/11/13)
  summaryDate: function(date){
    if(!date.getDOY){ return; }
    
    var now = new Date();
    if(now.getYear() === date.getYear()){
      var dayDiff = now.getDOY() - date.getDOY();
      if(dayDiff == 0){
        return date.format("h:MM TT");
      }
      if(dayDiff == 1){
        return "Yesterday";
      }
      if(dayDiff < 7){
        return date.format("dddd");
      }
    }
    
    // > 7 days ago
    return date.format("m/d/yy");
  }

};

// Return the Day Of Year
Date.prototype.getDOY = function() {
  var onejan = new Date(this.getFullYear(),0,1);
  return Math.ceil((this - onejan) / 86400000);
};