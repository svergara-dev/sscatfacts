module Auth
  class RegisterUser
    Result = Struct.new(:success?, :data, :error, keyword_init: true)

    def initialize(auth_service: AuthService.new)
      @auth_service = auth_service
    end

    def execute(username:, password:, password_confirmation:)
      unless password == password_confirmation
        return Result.new(
          success?: false,
          error: { code: "VALIDATION_ERROR", message: "Las contraseñas no coinciden" }
        )
      end

      if @auth_service.username_exists?(username)
        return Result.new(
          success?: false,
          error: { code: "USER_EXISTS", message: "El nombre de usuario ya está registrado" }
        )
      end

      result = @auth_service.create_user(username: username, password: password)

      if result[:success]
        Result.new(
          success?: true,
          data: {
            id: result[:user].id,
            username: result[:user].username,
            createdAt: result[:user].created_at.iso8601
          }
        )
      else
        Result.new(
          success?: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Error de validación",
            details: result[:errors].map { |msg| { message: msg } }
          }
        )
      end
    end
  end
end
