module Api
  module V1
    class UsersController < ApplicationController
      def favorites
        use_case = Users::GetUserFavorites.new
        result = use_case.execute(
          user: current_user,
          page: params[:page] || 1,
          limit: params[:limit] || 10
        )

        if result.success?
          render json: {
            success: true,
            data: result.data,
            meta: result.meta
          }, status: :ok
        else
          render json: ErrorSerializer.new(
            code: result.error[:code],
            message: result.error[:message]
          ).as_json, status: :unprocessable_entity
        end
      end

      def remove_favorite
        use_case = Users::RemoveFavorite.new
        result = use_case.execute(
          user: current_user,
          fact_id: params[:factId].to_i
        )

        if result.success?
          render json: {
            success: true,
            data: result.data
          }, status: :ok
        else
          render json: ErrorSerializer.new(
            code: result.error[:code],
            message: result.error[:message]
          ).as_json, status: error_status(result.error[:code])
        end
      end

      private

      def error_status(code)
        case code
        when "FAVORITE_NOT_FOUND", "NOT_FOUND" then :not_found
        else :unprocessable_entity
        end
      end
    end
  end
end
