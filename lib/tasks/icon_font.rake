namespace :icon_font do

  desc 'Prepare new icon font assets for the assets pipeline'
  task :format => :environment do
    require 'fileutils'
    require 'tempfile'

    document     = Rails.root.join('app', 'assets', 'fonts', 'icon', "style.css")
    document_tmp = Tempfile.new('xxx.scss')

    begin
      File.open(document, 'r') do |f|
        document_tmp.puts "// THIS FILE GENERATED BY ICON_FONTS RAKE TASK"
        document_tmp.puts "// DO NOT MODIFY MANUALLY"
        document_tmp.puts "// TO UPDATE FONTS:"
        document_tmp.puts "//   1) COPY CONTENTS OF NEW ICOMOON BUNDLE INTO app/assets/fonts/icon/"
        document_tmp.puts "//   2) RUN bundle exec rake icon_font:format"
        document_tmp.puts "//   3) TEST, COMMIT, PUSH\n"
        f.each_line do |line|
          document_tmp.puts(line.gsub("url('","font-url('icon/"))
        end
      end
    rescue
      puts "Icon Font Formatting Failed"
      document_tmp.close
      document_tmp.unlink
    else
      document_tmp.close
      FileUtils.mv(document_tmp.path,"#{File.dirname(document)}/_style-formatted.scss",:verbose => true)

      puts "Icon Font Successfully Formatted"
    end
  end

end