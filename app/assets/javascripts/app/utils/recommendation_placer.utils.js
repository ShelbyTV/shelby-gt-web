libs.utils.recommendationPlacer = {
  /*
    Function: placeRecs
    Arguments:
      recommendationsCollection - must be a Backbone Collection of recommendation DashboardEntries to insert
      destinationCollection - must be a Backbone Collection of DashboardEntries used as the master collection
        of a ListView, into which the recommendations will be inserted
      frameGroupsCollection - must be a frameGroupsCollection that is the display collection of the destinationCollection's
        ListView, which will be examined in order to space the recommendations evenly in the resulting visual output
      frameGroupsStartIndex - the index in the frameGroupsCollection at which to start looking for spots to insert the recommendations,
        default is 0
  */
  placeRecs : function(recommendationsCollection, destinationCollection, frameGroupsCollection, frameGroupsStartIndex){
    if (typeof(frameGroupsStartIndex) == "undefined") {
      frameGroupsStartIndex = 0;
    }

    // for each slice of frame groups of size slice in the frameGroupsCollection that doesn't already have a recommendation in it,
    // insert a new recommendation in the middle of the slice
    var slicesExamined = 0;
    var sliceIncrement = 2;
    while (recommendationsCollection.length && (frameGroupsStartIndex + (sliceIncrement * slicesExamined) < frameGroupsCollection.length)) {
      var startIndex = frameGroupsStartIndex + (slicesExamined * (sliceIncrement + 1));
      var endIndex = startIndex + sliceIncrement;
      var slice = frameGroupsCollection.models.slice(startIndex, endIndex);
      var sliceContainsRecommendation = _(slice).find(function(frameGroup){
        return frameGroup.has('primaryDashboardEntry') && frameGroup.get('primaryDashboardEntry').isRecommendationEntry();
      });

      slicesExamined++;

      if (slice.length && !sliceContainsRecommendation) {
        // get a recommendation to insert
        var recToInsert = recommendationsCollection.first();
        // to get the dynamic dashboard entry to show up in the right place in the stream,
        // we'll need to give it a fake id in the right place in the id sequence that the view sorts by
        var fakeDbeId = null;
        // if this is a channel recommendation, it may need to be de-duplicated
        // since Mark's frame groups collection doesn't allow this to be synchronized automatically
        // between the ListView simulated master collection and the frame groups collection,
        // we must take care of the master collection part manually here
        var channelRecDeduplicated = false;
        if (recToInsert.get('action') == libs.shelbyGT.DashboardEntryModel.ENTRY_TYPES.channelRecommendation) {
          var firstDuplicateVideoEntry = destinationCollection.find(function(dbe){
            return dbe.get('frame').get('video').id == recToInsert.get('frame').get('video').id;
          });
          if (firstDuplicateVideoEntry) {
            // there's a duplicate video for this recommendation, so we'll need
            // to set the dbentry with a fake id just before the item it will deduplicate with
            var duplicateVideoEntryId = new ObjectId(firstDuplicateVideoEntry.id);
            duplicateVideoEntryId.increment++;
            fakeDbeId = duplicateVideoEntryId.toString();
            channelRecDeduplicated = true;
          }
        }

        if (!fakeDbeId) {
          // aside from the special case above, we'll otherwise set an id just past the item
          // we want this recommendation to show up after
          var dbeToPlaceAfterId = new ObjectId(slice[0].get('primaryDashboardEntry').id);
          dbeToPlaceAfterId.increment--;
          fakeDbeId = dbeToPlaceAfterId.toString();
        }

        recToInsert.set('id', fakeDbeId);
        destinationCollection.add(recToInsert);
        recommendationsCollection.remove(recToInsert);
        console.log("Rec placed at", destinationCollection.indexOf(recToInsert));
        // if we deduplicated a channel recommendation, it may not have been placed in the slice where
        // we specified, so examine this slice again to see if it still needs a recommendation
        if (channelRecDeduplicated) {
          slicesExamined--;
        }
      }
    }
  }
};