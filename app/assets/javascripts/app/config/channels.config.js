shelby.config.channels = {
  'laugh' : {
    title : '#laugh',
    id : '5112fa93b415cc1de20c30a0',
    hashtagRollId : '5137594fb415cc6617000047',
    hashTags : ['laugh', 'lol']
  },
  'happenings' : {
    title : '#happenings',
    id : '5112fb26b415cc1e160cb0e5'
  },
  'learn' : {
    title : '#learnaboutyourworld',
    id : '5112fb5db415cc1ded0d79a1',
    hashtagRollId : '51375a3bb415cc6617000090',
    hashTags : ['learn', 'learnaboutyourworld']
  },
  'adrenaline' : {
    title : '#adrenaline',
    id : '5112fb95b415cc1ded0d8c89',
    hashtagRollId : '513759ccb415cc6617000069',
    hashTags : ['adrenaline']
  },
  'thisexists' : {
    title : '#thisexists',
    id: '5137560bb415cc636c035769',
    hashtagRollId : '513756efb415cc6617000008',
    hashTags : ['exists', 'thisexists']
  },
  'greatmoviemoments' : {
    title : '#greatmoviemoments',
    id: '51375788b415cc68d804aa71',
    hashtagRollId : '513757cbb415cc661700001a',
    hashTags : ['movies', 'greatmoviemoments', 'greatmoviemoment']
  },
  'storytellers' : {
    title : '#storytellers',
    id: '51375863b415cc57fe02eea9',
    hashtagRollId : '5137587eb415cc661700002a',
    hashTags : ['storytellers', 'storyteller', 'stories', 'story']
  },
  'nature' : {
    title : '#natureisrad',
    id: '5112fae1b415cc1e0b0e4d6e',
    hashtagRollId : '51375a90b415cc66170000a8',
    hashTags : ['natureisrad', 'nature']
  }
};

// create a flat array of all shelby channel hashtags
shelby.config.hashTags = _(shelby.config.channels).chain().map(function(channel){
  return channel.hashTags;
}).flatten().compact().value();
