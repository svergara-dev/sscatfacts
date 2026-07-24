module Auth
  class LoginUser
    Result = Struct.new(:success?, :token, :user, :error, keyword_init: true)

    def initialize(auth_service: AuthService.new, jwt_service: JwtService.new)
      @auth_service = auth_service
      @jwt_service = jwt_service
    end

    def execute(username:, password:)
      result = @auth_service.authenticate_user(username: username, password: password)

      unless result[:success]
        return Result.new(
          success?: false,
          error: { code: "INVALID_CREDENTIALS", message: "Credenciales incorrectas" }
        )
      end

      token = @jwt_service.encode(userId: result[:user].id, username: result[:user].username)

      Result.new(
        success?: true,
        token: token,
        user: result[:user]
      )
    end
  end
end
