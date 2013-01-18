ab_test "heart_queue_comparison" do
  description "Looking at difference in CTA of queue vs heart"
  alternatives :videocard_queue, :heart
  metrics :tracked_externally
end