module Api
  module V1
    class AuthController < ApplicationController
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
            data: result.data
          }, status: :created
        else
          render json: {
            success: false,
            error: result.error
          }, status: error_status(result.error[:code])
        end
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
