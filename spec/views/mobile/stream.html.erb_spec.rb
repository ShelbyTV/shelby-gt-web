require 'spec_helper'

describe "/m/stream" do
  xit "renders the _frame partial for each frame" do
    assign(:dashboard, [dbe,dbe])
    assign(:roll_type, Settings::Mobile.roll_types.stream)
    assign(:signed_in_user, @signed_in_user)
    assign(:page,1)
    render
    expect(view).to render_template(:partial => "_frame", :count => 2)
  end
end
