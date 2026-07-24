Rack::Attack.throttle("registration attempts by ip", limit: 3, period: 1.hour) do |req|
  req.ip if req.path == "/api/v1/auth/register" && req.post?
end

Rack::Attack.throttle("general requests by ip", limit: 100, period: 1.minute) do |req|
  req.ip unless req.path.start_with?("/up")
end

Rack::Attack.throttled_responder = lambda do |request|
  match_data = request.env["rack.attack.match_data"]
  now = Time.current
  retry_after = match_data[:period] - (now.to_i % match_data[:period])

  headers = {
    "Content-Type" => "application/json",
    "Retry-After" => retry_after.to_s,
    "X-RateLimit-Limit" => match_data[:limit].to_s,
    "X-RateLimit-Remaining" => "0",
    "X-RateLimit-Reset" => (now + retry_after).iso8601
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
