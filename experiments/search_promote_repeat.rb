ab_test "search_promote_repeat" do
  description "Does the search UI promote searching multiple times?"
  alternatives :do, :dont
  metrics :tracked_externally
end