ab_test "search_landing_banner_appear" do
  description "When does the login/signup banner appear when a logged out user lands on /search"
  alternatives :immediately, :on_click
  metrics :tracked_externally
end