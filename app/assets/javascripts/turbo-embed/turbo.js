/* ShelbyTurbo enabled pages (see turbo-bootstrap.js) load this file.
 * 
 * This is the workhorse.  Pretty simple algorithm (devil is in details):
 *  1) Find all embeds we support
 *  2) Ship them off to find out what we can do with them
 *  3) Enhance them
*/
window.__shelbyTurbo = {
  
  //local copy of no-conflict jQuery
  $:null,
  
  /* The associated Shelby username for enhancing video embeds found on our host page.
   * We expect this to be set via _stq before initialization.
   */
  nick:null,
  
  // single entry point called by the Kick Off jQuery loader at bottom of this file
  init: function(jq){
    this.$ = jq;
    this._processQueue(_stq);
    this._processPage();
  },
  
  _processPage: function(){
    var allVideoEmbeds = this._scrapePageForVideoEmbeds();
    if(allVideoEmbeds){
      // help the returned JS can directly update the elements on the page
      this._tagVideoEmbeds(allVideoEmbeds);
      
      
      console.log("[turbo] video embeds found + tagged:", allVideoEmbeds);
      //TODO: ship them off for processing w/ username (this.nick)
      //      server needs to look to see if nick has rolled these videos, if so
      //      A) server returns some JS that directly modifies our host page
      //      B) server returns some data that we use to modify our host page
      // ?? which server ??
      // => i think i like A, a LOT more (need to tag our elements so returned JS can reference them)
      // 
      // maybe we should send request to FRONT END, which would proxy to back end to find out what it needs
      // then the front end can return the JS that updates this page (that's what the front end does best!)
    }
  },
  
  /* --------------------------- Command Queue --------------------------- */
  
  /* We use commands pushed on a queue to communicate with Shelby Turbo
   * This allows options to be set without worry about if/when our JS is loaded.
   *
   * 1) replace q.push(cmd) with our own handler (for future commands/options)
   * 2) processes everything currently on the given command queue
   */
  _processQueue: function(q){
    q.push = $.proxy(this._processQueueCommand, this);
    for(var i = 0; i < q.length; i++){
      this._processQueueCommand(q[i]);
    }
  },
  
  /* Process a single option/command.  See processQueue() for discussion.
   */
  _processQueueCommand: function(cmd){
    //only care about "set" right now
    if(typeof(cmd) !== "object"){ return; }
    switch(cmd[0]){
      case 'set':
        if(cmd.length !== 3){ return; }
        this[cmd[1]] = cmd[2];
        break;
    }
  },
  
  /* --------------------------- Page Processing --------------------------- */
  
  // returns an array with metadata on all known video embeds
  // ex: [{el: DOMNode, providerName: 'youtube', providerDomain: 'youtube.com', videoId: 'O4GEk-NjRNo'}]
  _scrapePageForVideoEmbeds: function(){
    var self = this,
    match = null,
    videoEmbeds = [],
    possibleVideoEmbeds = $('iframe, embed, video');

    //for each embed, check src attribute to find known video embed
    possibleVideoEmbeds.each(function(n, embed){
      match = null;
      
      if(embed.src){
        $.each(self.embedProviders, function(m, embedProvider){
          
          $.each(embedProvider.embedSrcRegex, function(o, srcRegExp){
            if(match = srcRegExp.exec(embed.src)){
              videoEmbeds.push({
                el: embed,
                providerName: embedProvider.providerName,
                providerDomain: embedProvider.providerDomain,
                videoId: match[1] // the srcRegExp captures only the video ID
              });
              //break embedSrcRegex search
              return false;
            }
          });
          
          //break embedProviders search
          if(match){ return false; }
        });
      }
    });
    
    return videoEmbeds;
  },
  
  /*
   * Sets attribute shelby-turbo-tag with some UNIQUE_TAG value on each video embed element on the page.
   * Saves this paring (shelby-turbo-tag = UNIQUE_TAG) for each object in the given video embeds array.
   *
   * This allows the returned JS to update the page directly via $("[shelby-turbo-tag=UNIQUE_TAG]")
   */
  _tagVideoEmbeds: function(allVideoEmbeds){
    var tag = "T-"+Date.now()+"-";
    $.each(allVideoEmbeds, function(i, embed){
      $(embed.el).attr('shelby-turbo-tag', tag+i);
      embed['shelby-turbo-tag'] = tag+i;
    });
  },
  
  /* --------------------------- Constants --------------------------- */
  
  /* providerName: the name of the video hosting provider we're detecting
   * providerDomain: the domain of the above
   * embedSrcRegex: compared against the embed sources found on the page to detect known video
   *                this RegExp must capture only the video ID (ie. RegExp.exec(embedSrc)[1] == videoID)
   */
  embedProviders: [
    {
      providerName: "youtube",
      providerDomain: "youtube.com",
      embedSrcRegex: [
        /&video_id=([\_\-a-zA-Z0-9]+)/, 
        /youtube\.com\/v\/([\_\-a-zA-Z0-9]+)/, 
        /youtube\-nocookie\\.com\/v\/([\_\-a-zA-Z0-9]+)/,
        /youtube\.com\/embed\/([\_\-a-zA-Z0-9]+)/
        ]
    },
    {
      providerName: "vimeo",
      providerDomain: "vimeo.com",
      embedSrcRegex: [
        /vimeo\.com\/moogaloop\.swf\?clip_id=([0-9]+)/,
        /clip_id=([0-9]+)&server=vimeo\.com/,
        /clip_id=([0-9]+)/,
        /(player.vimeo.com\/video\/)(\d*)/,
        /(player)(\d*)[^_]/,
        /player_(\d+)_\d+/
        ]
    }]
  
};


/* 
 * Kick Off 
 *
 * Start everything in motion by loading jQuery (if necessary) and passing it to __shelbyTubo.init(jq)
 * for jQuery loading, see http://benalman.com/projects/run-jquery-code-bookmarklet/ 
 */
(function(e,a,g,h,f,c,b,d){if(!(f=e.jQuery)||g>f.fn.jquery||h(f)){c=a.createElement("script");c.type="text/javascript";c.src="http://ajax.googleapis.com/ajax/libs/jquery/"+g+"/jquery.min.js";c.onload=c.onreadystatechange=function(){if(!b&&(!(d=this.readyState)||d=="loaded"||d=="complete")){h((f=e.jQuery).noConflict(1),b=1);f(c).remove();}};a.documentElement.childNodes[0].appendChild(c);}})(window,document,"1.7.1",function($,L){ window.__shelbyTurbo.init($); });
