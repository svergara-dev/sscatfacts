module Auth
  class AuthService
    def create_user(username:, password:)
      user = User.new(username: username, password: password, password_confirmation: password)

      if user.save
        { success: true, user: user }
      else
        { success: false, errors: user.errors.full_messages, error_details: user.errors }
      end
    end

    def username_exists?(username)
      User.exists?(username: username)
    end
  end
end
