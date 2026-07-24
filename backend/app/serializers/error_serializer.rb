class ErrorSerializer
  def initialize(code:, message:, details: nil)
    @code = code
    @message = message
    @details = details
  end

  def as_json
    error = { code: @code, message: @message }
    error[:details] = @details if @details.present?
    { success: false, error: error }
  end
end
