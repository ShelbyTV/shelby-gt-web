ab_test "landing_messaging" do
  description "Try different messaging to increase click through to signup"
  alternatives :discover_and_enjoy, :powered_by_friends
  metrics :tracked_externally
end
