BackboneFactory.define('conversation', libs.shelbyGT.ConversationModel);

BackboneFactory.define('frame', libs.shelbyGT.FrameModel, function() {
  return {
    conversation : BackboneFactory.create('conversation')
  };
});

BackboneFactory.define('frame_group', libs.shelbyGT.FrameGroupModel, function() {
  var framesCollection = new Backbone.Collection();
  framesCollection.add(BackboneFactory.create('frame'));
  return {
    frames : framesCollection
  };
});