ab_test "heart_queue_comparison" do
  description "Looking at difference in CTA of queue vs star"
  alternatives :videocard_queue, :star
  metrics :tracked_externally
end