ab_test "onboarding_first_step" do
  description "Which step of onboarding is better to show first?"
  alternatives :add_video, :connect_services
  metrics :tracked_externally
end
