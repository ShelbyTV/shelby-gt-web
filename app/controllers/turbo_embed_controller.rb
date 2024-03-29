require 'shelby_api'

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
  #  userId = The User's id for the public roll we care about
  #  providerName = The name of the video provider for the given embed
  #  videoId = the unique id of the given video at the given provider
  #  shelbyTurboTag = The given video embed has an attribute shelby-turbo-tag on the host page.
  #                   It is set to this value.  Our returned JS directly updates the page.
  #
  def embellish
    # Get the given user and the frames on their public roll
    @user = Shelby::API.get_user(params[:userId])
    @roll = Shelby::API.get_roll_with_frames(@user['personal_roll_id'], '') if @user

    render :nothing => true and return unless @user and @roll

    @embed_attr_key = "shelby-turbo-tag"
    @embed_attr_val = params[:shelbyTurboTag]

    # Render embellishments if we find the correct video in the roll
    @roll['frames'].each do |frame|
      @video = frame['video']
      if @video and @video['provider_name'] == params[:providerName] and @video['provider_id'] == params[:videoId]
        respond_to do |format|
          format.js { render and return }
          format.any { render :nothing => true and return }
        end
      end
    end

    # fell through
    render :nothing => true
  end

  # GET /embed/:frame_id
  #
  # Renders the frame identified, loads player and begins playback (using our universal player integration) on click.
  #
  # Designed to be placed inside of an iframe like
  # <iframe width="560" height="315" src="http://shelby.tv/embed/87234ab98de09f098f" frameborder="0" allowfullscreen></iframe>
  #
  # Can be shown without the footer with query param "footer=0"
  #
  # Implementing generically. First deployment Chips Ahoy March Madness partnership 2013.
  #
  def embed
    if @frame = Shelby::API.get_frame(params[:frame_id], true)
      @footer_control_class = (params[:footer] == "0" ? "embedded-frame--no-footer" : "embedded-frame--with-footer")

      render :layout => 'embed'
    else
      render :nothing => true
    end
  end

end
