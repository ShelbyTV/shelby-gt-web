ab_test "dot_tv_layout" do
  description "Try different layouts for the view when a visitor arrives at a .tv"
  alternatives :original, :user_profile
  metrics :tracked_externally
end