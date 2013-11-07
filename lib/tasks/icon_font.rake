namespace :icon_font do

  desc 'Prepare new icon font assets for the assets pipeline'
  task :format => :environment do
    require 'fileutils'
    require 'tempfile'

    document     = Rails.root.join('app', 'assets', 'fonts', 'icon', "style.css")
    document_tmp = Tempfile.new('xxx.scss')

    begin
      File.open(document, 'r') do |f|
        f.each_line do |line|
          document_tmp.puts(line.gsub("url('","x-url('"))
        end
      end
    rescue
      puts "Icon Font Formatting Failed"
    ensure
      document_tmp.close
      FileUtils.mv(document_tmp.path,"#{File.dirname(document)}/_style.scss",:verbose => true)
      File.rename(document,"#{document}.bak")

      puts "Icon Font Successfully Formatted"
    end
  end

end
