// NOTE: in the hashTags array for a channel, the first hastag in the
// array is considered the canonical hashtag for that channel, so in
// any case where the app is looking for a hashtag for that channel
// and has not been supplied one by the user, it will use the canonical
// (first) hashtag

shelby.config.channels = {
  'community' : {
    title : 'community',
    id: '515d83ecb415cc0d1a025bfe',
    includeInNav : true
  },
  'laugh' : {
    title : '#laugh',
    id : '5112fa93b415cc1de20c30a0',
    hashtagRollId : '5137594fb415cc6617000047',
    hashTags : ['laugh', 'lol'],
    includeInNav : true,
    rollingHashtagButton : true
  },
  'happenings' : {
    title : '#happenings',
    id : '5112fb26b415cc1e160cb0e5',
    includeInNav : true
  },
  'learn' : {
    title : '#learnaboutyourworld',
    id : '5112fb5db415cc1ded0d79a1',
    hashtagRollId : '51375a3bb415cc6617000090',
    hashTags : ['learnaboutyourworld', 'learn'],
    includeInNav : true,
    rollingHashtagButton : true
  },
  'adrenaline' : {
    title : '#adrenaline',
    id : '5112fb95b415cc1ded0d8c89',
    hashtagRollId : '513759ccb415cc6617000069',
    hashTags : ['adrenaline'],
    includeInNav : true,
    rollingHashtagButton : true
  },
  'thisexists' : {
    title : '#thisexists',
    id: '5137560bb415cc636c035769',
    hashtagRollId : '513756efb415cc6617000008',
    hashTags : ['thisexists', 'exists'],
    includeInNav : true,
    rollingHashtagButton : true
  },
  'greatmoviemoments' : {
    title : '#greatmoviemoments',
    id: '51375788b415cc68d804aa71',
    hashtagRollId : '513757cbb415cc661700001a',
    hashTags : ['greatmoviemoments', 'movies', 'greatmoviemoment'],
    includeInNav : true,
    rollingHashtagButton : true
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
    hashTags : ['natureisrad', 'nature'],
    includeInNav : true,
    rollingHashtagButton : true
  }
};