libs.utils.String = {
  // sanitize a string for use as a url path segment
  toUrlSegment : function(string){
    // replace spaces and non-word characters with underscores
    return string.replace(/\s+|\W+/g, '_');
  },
 };