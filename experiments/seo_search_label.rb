ab_test "seo_search_label" do
  description "Determine if a header label is influencing the effectiveness of a giant search field"
  alternatives :show_label, :hide_label
  metrics :tracked_externally
end