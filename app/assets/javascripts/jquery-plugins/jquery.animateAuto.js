jQuery.fn.animateAuto = function(prop, speed, callback){
    var elem, height, width;
    return this.each(function(i, el){
        el = jQuery(el), elem = el.clone().css({"height":"auto","width":"auto"}).appendTo(el.parent());
        height = elem.css("height"),
        width = elem.css("width"),
        elem.remove();

        var onAnimationEnd = function() {
          // set the selected properties to true 'auto' values
          if(prop === "height")
            el.css({"height":'auto'});
          else if(prop === "width")
            el.css({"width":'auto'});
          else if(prop === "both")
            el.css({"width":'auto',"height":'auto'});
          if (callback) {
            callback();
          }
        };

        if(prop === "height")
            el.animate({"height":height}, speed, onAnimationEnd);
        else if(prop === "width")
            el.animate({"width":width}, speed, onAnimationEnd);
        else if(prop === "both")
            el.animate({"width":width,"height":height}, speed, onAnimationEnd);
    });
};