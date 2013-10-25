ab_test "seo_show_play_on_related" do
  description "Does a we get more clicks on related content with play buttons?"
  alternatives :true, :false
  metrics :tracked_externally
end
