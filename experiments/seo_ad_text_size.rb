ab_test "seo_ad_text_size" do
  description "Which text size on the seo page ads gets more click-throughs?"
  alternatives :small, :large
  metrics :tracked_externally
end