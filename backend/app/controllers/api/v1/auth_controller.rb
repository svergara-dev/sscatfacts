module Api
  module V1
    class AuthController < ApplicationController
      skip_before_action :authenticate_request, only: [ :register, :login ]

      def register
        use_case = Auth::RegisterUser.new
        result = use_case.execute(
          username: params[:username],
          password: params[:password],
          password_confirmation: params[:confirmPassword]
        )

        if result.success?
          render json: {
            success: true,
            data: UserSerializer.new(result.user).as_json
          }, status: :created
        else
          render json: ErrorSerializer.new(
            code: result.error[:code],
            message: result.error[:message],
            details: result.error[:details]
          ).as_json, status: error_status(result.error[:code])
        end
      end

      def login
        use_case = Auth::LoginUser.new
        result = use_case.execute(
          username: params[:username],
          password: params[:password]
        )

        if result.success?
          render json: {
            success: true,
            data: {
              token: result.token,
              user: UserSerializer.new(result.user).as_json
            }
          }, status: :ok
        else
          render json: ErrorSerializer.new(
            code: result.error[:code],
            message: result.error[:message]
          ).as_json, status: :unauthorized
        end
      end

      def me
        render json: {
          success: true,
          data: UserSerializer.new(current_user).as_json
        }, status: :ok
      end

      private

      def error_status(code)
        case code
        when "VALIDATION_ERROR" then :bad_request
        when "USER_EXISTS" then :conflict
        else :unprocessable_entity
        end
      end
    end
  end
end
