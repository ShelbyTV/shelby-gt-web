ab_test "landing_messaging" do
  description "Try different messaging to increase click through to signup"
  alternatives :videos_youll_love, :discover_and_enjoy, :just_for_you, :powered_by_friends
  metrics :tracked_externally
end
