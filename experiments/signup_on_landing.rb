ab_test "signup_on_landing" do
  description "Are we better off with a signup form on the landing page"
  alternatives :yes, :no
  metrics :tracked_externally
end
