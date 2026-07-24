module Api
  module V1
    class FactsController < ApplicationController
      def random
        use_case = Facts::FetchRandomFact.new
        result = use_case.execute(user: current_user)

        if result.success?
          render json: {
            success: true,
            data: FactSerializer.new(result.data).as_json
          }, status: :ok
        else
          render json: ErrorSerializer.new(
            code: result.error[:code],
            message: result.error[:message]
          ).as_json, status: error_status(result.error[:code])
        end
      end

      def list
        use_case = Facts::ListFacts.new
        result = use_case.execute(
          user: current_user,
          page: (params[:page] || 1).to_i,
          limit: [ (params[:limit] || 10).to_i, 50 ].min
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
          ).as_json, status: error_status(result.error[:code])
        end
      end

      def like
        use_case = Likes::LikeFact.new
        result = use_case.execute(user: current_user, fact_id: params[:id].to_i)

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

      def unlike
        use_case = Likes::UnlikeFact.new
        result = use_case.execute(user: current_user, fact_id: params[:id].to_i)

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
        when "EXTERNAL_API_ERROR" then :service_unavailable
        when "ALREADY_LIKED" then :conflict
        when "LIKE_NOT_FOUND", "NOT_FOUND" then :not_found
        else :unprocessable_entity
        end
      end
    end
  end
end
