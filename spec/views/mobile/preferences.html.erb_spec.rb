require 'spec_helper'

describe "/m/preferences/profile" do
  xit "renders the _user_card partial for each source" do
    @qty = 2
    assign(:sources, user_card(@qty))
    render :template => "mobile/preferences_sources", :layout => "layouts/mobile"
  end
end
