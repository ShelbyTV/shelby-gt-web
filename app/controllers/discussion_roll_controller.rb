class DiscussionRollController < ApplicationController
  
  ##
  # Display a discussion roll (aka video conversation)
  #   AUTHENTICATION OPTIONAL
  #
  # GET /chat/:roll_id
  #
  #
  def show
    # TODO: could do some clever shit if the user was logged in vs not
    #       but don't need to.  KISS for now.  JS needs to handle all cases anyway, i think.
    render '/home/app'
  end
  
end