// Determine if the error occurred before or after document ready
jQuery(function() { window.shelby_onreadyFired = true; });

// don't flood us with errors
window.shelby_maxErrorCount = 5;
window.shelby_errorCount = 0;

window.onerror = function(errorMsg, file, lineNumber) {
  if (shelby && shelby.config.environment == 'production' && window.shelby_errorCount <= window.shelby_maxErrorCount) {
    window.shelby_errorCount += 1;

    // will re-post to newrelic
    jQuery.post(shelby.config.apiRoot+'/js_err', 
      { error_message: errorMsg, 
        uri: window.location.href,
        client: "WebFrontEnd",
        ua: navigator.userAgent,
        file: file, 
        lineNumber: lineNumber, 
        documentReady: window.shelby_onreadyFired, 
      });
  }
};