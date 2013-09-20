module MetaTagHelper

  def get_info_for_meta_tags(path)
    if path_match = /roll\/\w*\/frame\/(\w*)/.match(path)
      # the url is a frame
      @frame = Shelby::API.get_first_frame_on_roll(path_match[1])
      @video = Shelby::API.get_video() if @frame
    elsif path_match = /roll\/(\w*)(\/.*)*/.match(path) or path_match = /user\/(\w*)\/personal_roll/.match(path)
      # the url is a roll or personal roll
      @roll = Shelby::API.get_roll_with_frames(path_match[1], '')
      @user = Shelby::API.get_user(@roll['creator_id']) if @roll
    end
  end

end
