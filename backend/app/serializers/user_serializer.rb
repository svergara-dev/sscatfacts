class UserSerializer
  def initialize(user)
    @user = user
  end

  def as_json
    {
      id: @user.id,
      username: @user.username,
      createdAt: @user.created_at.iso8601
    }
  end
end
