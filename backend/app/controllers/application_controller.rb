class ApplicationController < ActionController::API
  include ErrorHandler

  before_action :authenticate_request

  private

  def authenticate_request
    token = request.headers["Authorization"]&.split(" ")&.last
    decoded = Auth::JwtService.new.decode(token)

    if decoded
      @current_user = User.find_by(id: decoded[:userId])
    end

    render_unauthorized unless @current_user
  end

  def current_user
    @current_user
  end

  def render_unauthorized
    render json: ErrorSerializer.new(
      code: "UNAUTHORIZED",
      message: "Token inválido o expirado"
    ).as_json, status: :unauthorized
  end
end
