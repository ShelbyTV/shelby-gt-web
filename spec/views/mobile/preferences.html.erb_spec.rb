require 'spec_helper'

describe "/m/preferences" do

  it "infers the controller path" do
    expect(controller.request.path_parameters[:controller]).to eq("mobile")
    expect(controller.controller_path).to eq("mobile")
  end

end
