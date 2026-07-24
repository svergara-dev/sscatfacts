module Auth
  class JwtService
    SECRET_KEY = Rails.application.credentials.jwt_secret_key || ENV.fetch("JWT_SECRET", "development_secret_key")
    ALGORITHM = "HS256"
    EXPIRATION = 24.hours

    def encode(payload)
      payload[:iat] = Time.current.to_i
      payload[:exp] = EXPIRATION.from_now.to_i
      JWT.encode(payload, SECRET_KEY, ALGORITHM)
    end

    def decode(token)
      decoded = JWT.decode(token, SECRET_KEY, true, algorithm: ALGORITHM)
      decoded.first.with_indifferent_access
    rescue JWT::DecodeError, JWT::ExpiredSignature
      nil
    end
  end
end
