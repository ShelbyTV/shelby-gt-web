require 'spec_helper'

describe "radar/index" do
  before(:all) do
    #I'm not exactly sure, yet, what should be in the before block vs. the it block.
    assign(:embed_video, true)
    assign(:ga_category, "Radar")
    assign(:index, 0)
    assign(:signed_in_user, user)
    assign(:user_signed_in, true)
    assign(:found_video_providers, ['youtube'])

    @qty = 2
  end

  it "renders the objects/_video partial for #{@qty} videos" do
    assign(:videos, video(@qty))

    render

    rendered.should have_selector('.frame', :count => @qty)
  end

end
