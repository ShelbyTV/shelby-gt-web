require 'spec_helper'

describe "radar/index" do
  before(:all) do
    assign(:signed_in_user, user)
  end

  it "renders the objects/_video partial for each video" do
    @qty = 2

    assign(:videos, video(@qty))

    render

    rendered.should have_selector(".frame", :count => @qty)
  end
end
