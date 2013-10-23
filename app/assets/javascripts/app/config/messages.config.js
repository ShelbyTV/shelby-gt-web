shelby.config.messages = {
  dviSharingMessages : [
    "Sharing is caring.",
    "Share and ye shall recieve.",
    "Your friends are probably bored. Send them something to watch.",
    "Stop. Sharing time.",
    "Who else would watch this? No really, who else would?",
    "Simon says: share this with a friend.",
    "Share this. We won't run out."
  ],

  randomMessage : function(arrayName){
    var _array = this[arrayName];
    var rand = _.random(0, _array.length -1);
    return _array[rand];
  }
};
