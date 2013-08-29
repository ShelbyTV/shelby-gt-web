ab_test "signup_w_fb" do
  description "Are we better off with a social signup on the landing page"
  alternatives :yes, :no
  metrics :tracked_externally
end
