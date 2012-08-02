BackboneFactory.define('roll', libs.shelbyGT.RollModel);

BackboneFactory.define('user', libs.shelbyGT.UserModel, function() {
  return {
    personal_roll : BackboneFactory.create('roll')
  };
});

BackboneFactory.define('conversation', libs.shelbyGT.ConversationModel);

BackboneFactory.define('video', libs.shelbyGT.VideoModel);

BackboneFactory.define('rollscollection', libs.shelbyGT.RollsCollectionModel);

BackboneFactory.define('frame', libs.shelbyGT.FrameModel, function() {
  return {
    conversation : BackboneFactory.create('conversation'),
    video : BackboneFactory.create('video')
  };
});

BackboneFactory.define('frame_group', libs.shelbyGT.FrameGroupModel, function() {
  var framesCollection = new Backbone.Collection();
  framesCollection.add(BackboneFactory.create('frame'));
  return {
    frames : framesCollection
  };
});