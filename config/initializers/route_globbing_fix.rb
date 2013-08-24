# Fix for a Rails 3 bug where route constraints don't work with route globbing
#
# Have to monkey-patch the fix in, since it's not scheduled for release until
# Rails 4.0.
require 'action_dispatch/routing/mapper'

module ActionDispatch
  module Routing
    class Mapper
      class Mapping

        private

          def requirements
            @requirements ||= (@options[:constraints].is_a?(Hash) ? @options[:constraints] : {}).tap do |requirements|
              requirements.reverse_merge!(@scope[:constraints]) if @scope[:constraints]
              @options.each { |k, v| requirements[k] ||= v if v.is_a?(Regexp) }
            end
          end

      end
    end
  end
end