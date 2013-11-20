require 'spec_helper'

describe "/m/preferences/profile" do

  before(:each) do
    view.stub(:csrf_token_from_cookie, 'true').and_return(true)
    assign(:signed_in_user, user)
  end

  xit "renders the _user_card partial for each source" do
    @qty = 2
    assign(:sources, user_card(@qty))
    render :template => "mobile/preferences_sources", :layout => "layouts/mobile"
    expect(rendered).to include("Roll Title")
  end
end
