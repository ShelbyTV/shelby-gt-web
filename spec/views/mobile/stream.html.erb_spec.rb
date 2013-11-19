require 'spec_helper'

describe "/m/stream" do
  # before(:all) do
  #   @frame => {
  #     :like_count => 1,
  #     :likers => {
  #       :has_shelby_avatar => :false,
  #       :user_image        => 'image.png'
  #     },
  #     :id => 123,
  #     :created_at => "13m ago"
  #     :originator => {
  #       :name     => "leonard nimoy",
  #       :nickname => "mrspock1969"
  #     }
  #     :conversation => {
  #       :messages => [
  #         :text   => "this is a comment left by the user"
  #       ]
  #     }
  #     :upvoters => [
  #       "528b6ec425dcca5630009c48"
  #     ]
  #   }

  #   @frame_owner => {
  #     :authentications => [
  #       {
  #         :provider  => "twitter"
  #         :name      => "burt reynolds"
  #         :nickname  => "breynolds100"
  #         :user_type => 1
  #       }
  #     ]
  #   }

  #   @video => {
  #     :embed_url     => "http://www.youtube.com/v/ZRVvDMiSYjM&feature=youtube_gdata_player"
  #     :id            => "528b6f1359b05250ee002384"
  #     :thumbnail_url => "http://i1.ytimg.com/vi/ZRVvDMiSYjM/0.jpg"
  #     :title         => "Multi-City Skateboard Jam Competition - Red Bull Interskate"
  #     :provider_id   => "ZRVvDMiSYjM"
  #     :provider_name => "youtube"
  #   }

  #   @dbe1 => {
  #     :embed_video    => false,
  #     :frame          => @frame,
  #     :frame_owner    => @frame_owner,
  #     :ga_category    => "Mobile",
  #     :index          => index,
  #     :is_mobile      => true,
  #     :roll_type      => Settings::Mobile.roll_types.stream,
  #     :signed_in_user => true,
  #     :video          => @video,
  #     :dbe            => dbe
  #   }

  # end

  xit "renders the _frame partial for each frame" do

    assign(:dashboard, [@dbe1,@dbe2])
    assign(:roll_type, Settings::Mobile.roll_types.stream)
    assign(:signed_in_user, @signed_in_user)
    assign(:page,1)
    render
    expect(view).to render_template(:partial => "_frame", :count => 2)
  end
end
