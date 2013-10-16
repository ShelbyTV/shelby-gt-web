ab_test "onboarding_with_invites" do
  description "Are we better off with invites in onboarding?"
  alternatives :yes, :no
  metrics :tracked_externally
end
