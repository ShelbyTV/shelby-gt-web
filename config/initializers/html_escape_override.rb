# Protect ourselves from UTF-8 errors when automatic html sanitizing occurs
class ::ERB
  module Util

    if RUBY_VERSION >= '1.9'
      def html_escape(s)
        s = s.to_s
        if s.html_safe?
          s
        else
          unless s.valid_encoding?
            s.encode!('utf-8', 'binary', :invalid => :replace, :undef => :replace, :replace => '?')
          end
          s.gsub(/[&"'><]/, HTML_ESCAPE).html_safe
        end
      end
    else
      def html_escape(s) #:nodoc:key => "value",
        s = s.to_s
        if s.html_safe?
          s
        else
          unless s.valid_encoding?
            s.encode!('utf-8', 'binary', :invalid => :replace, :undef => :replace, :replace => '?')
          end
          s.gsub(/[&"'><]/n) { |special| HTML_ESCAPE[special] }.html_safe
        end
      end
    end

    # Aliasing twice issues a warning "discarding old...". Remove first to avoid it.
    remove_method(:h)
    alias h html_escape

    module_function :h

    singleton_class.send(:remove_method, :html_escape)
    module_function :html_escape

  end
end