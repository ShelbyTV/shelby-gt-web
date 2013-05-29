module Shelby
  class HashErrorChecker
    # wrap the common pattern of traversing a chain of nested
    # hashes (which may or may not be present) to check for an
    # error description
    # returns the error description if there is one, otherwise nil
    def self.get_hash_error(error_hash, keys_chain)

      return nil unless error_hash

      error_value = error_hash
      begin
        keys_chain.each do |k|
          error_value = error_value[k]
        end
      rescue
        return nil
      end

      return error_value

    end
  end
end
