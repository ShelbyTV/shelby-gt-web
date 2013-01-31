class TurboEmbedController < ApplicationController
  

  # GET /turbo_embellish
  #
  # Called by turbo.js running on a host page.  turbo.js has found video embeds
  # and sends each of them to this route, giving us the opportunity to update the
  # host page.
  #
  # For the given video embed, see if the given user rolled it.
  # If so, return some JS that will update the host page accordingly.
  # Otherwise, we are doing nothing for now.
  #
  # required params:
  #  nick = The User's nickname for the public roll we care about
  #  providerName = The name of the video provider for the given embed
  #  videoId = the unique id of the given video at the given provider
  #  shelbyTurboTag = The given video embed has an attribute shelby-turbo-tag on the host page.
  #                   It is set to this value.  Our returned JS directly updates the page.
  #
  def embellish
    #TODO
  end


end