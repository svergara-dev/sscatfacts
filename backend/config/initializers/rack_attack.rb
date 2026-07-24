Rack::Attack.throttle("registration attempts by ip", limit: 3, period: 1.hour) do |req|
  req.ip if req.path == "/api/v1/auth/register" && req.post?
end

Rack::Attack.throttle("general requests by ip", limit: 100, period: 1.minute) do |req|
  req.ip unless req.path.start_with?("/up")
end

Rack::Attack.throttled_responder = lambda do |request|
  match_data = request.env["rack.attack.match_data"]
  now = Time.current

  headers = {
    "Content-Type" => "application/json",
    "Retry-After" => (match_data[:period] - (now.to_i % match_data[:period])).to_s
  }

  body = {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Demasiadas solicitudes. Intente más tarde."
    }
  }

  [ 429, headers, [ body.to_json ] ]
end
