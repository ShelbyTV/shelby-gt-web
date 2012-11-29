/*
 * A discussion roll is just a Roll, and its messages are just regular Messages.  But,
 * we create them by posting to a different route.  Hence, this model exists.
 *
 * NB: Not extending the MessageModel b/c we're overriding 100% of it's methods and I
 * don't want new changes in that model to fuck with this one.
 */
libs.shelbyGT.DiscussionRollMessageModel = libs.shelbyGT.ShelbyBaseModel.extend({

  url : function(){
    return shelby.config.apiRoot + '/discussion_roll/'+this.get('discussion_roll_id')+'/messages';
  }

});
