module ErrorHandler
  extend ActiveSupport::Concern

  included do
    rescue_from ActiveRecord::RecordNotFound do |e|
      render json: ErrorSerializer.new(
        code: "NOT_FOUND",
        message: e.message
      ).as_json, status: :not_found
    end

    rescue_from ActiveRecord::RecordInvalid do |e|
      render json: ErrorSerializer.new(
        code: "VALIDATION_ERROR",
        message: e.message,
        details: e.record.errors.full_messages.map { |msg| { message: msg } }
      ).as_json, status: :unprocessable_entity
    end

    rescue_from ActionController::ParameterMissing do |e|
      render json: ErrorSerializer.new(
        code: "VALIDATION_ERROR",
        message: "Faltan parámetros requeridos: #{e.param}"
      ).as_json, status: :bad_request
    end
  end
end
