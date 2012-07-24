libs.utils.String = {
  // sanitize a string for use as a url path segment
  toUrlSegment : function(string){
    // replace spaces and non-word characters with underscores
    return string.replace(/\s+|\W+/g, '-');
  },
  
  pluralize : function(count, toPluralize, pluralVersion){
    if(count === 1){
      return count+' '+toPluralize;
    } 
    else {
      return count+' '+(pluralVersion || toPluralize+'s');
    }
  }
 };