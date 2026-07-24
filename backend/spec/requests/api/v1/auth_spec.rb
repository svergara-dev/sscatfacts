require "rails_helper"

RSpec.describe "Api::V1::Auth", type: :request do
  include ActiveSupport::Testing::TimeHelpers

  before { Rack::Attack.reset! }

  describe "POST /api/v1/auth/register" do
    context "with valid params" do
      let(:valid_params) do
        {
          username: "catlover123",
          password: "password123",
          confirmPassword: "password123"
        }
      end

      it "returns 201 Created" do
        post "/api/v1/auth/register", params: valid_params

        expect(response).to have_http_status(:created)
      end

      it "returns success with user data" do
        post "/api/v1/auth/register", params: valid_params

        json = JSON.parse(response.body)
        expect(json["success"]).to be true
        expect(json["data"]["id"]).to be_present
        expect(json["data"]["username"]).to eq("catlover123")
        expect(json["data"]["createdAt"]).to be_present
        expect(json["data"]).not_to have_key("password")
        expect(json["data"]).not_to have_key("password_digest")
      end

      it "creates a new user" do
        expect {
          post "/api/v1/auth/register", params: valid_params
        }.to change(User, :count).by(1)
      end
    end

    context "when username already exists" do
      before { create(:user, username: "catlover123") }

      let(:duplicate_params) do
        {
          username: "catlover123",
          password: "password123",
          confirmPassword: "password123"
        }
      end

      it "returns 409 Conflict" do
        post "/api/v1/auth/register", params: duplicate_params

        expect(response).to have_http_status(:conflict)
      end

      it "returns USER_EXISTS error" do
        post "/api/v1/auth/register", params: duplicate_params

        json = JSON.parse(response.body)
        expect(json["success"]).to be false
        expect(json["error"]["code"]).to eq("USER_EXISTS")
        expect(json["error"]["message"]).to eq("El nombre de usuario ya está registrado")
      end

      it "does not create duplicate user" do
        expect {
          post "/api/v1/auth/register", params: duplicate_params
        }.not_to change(User, :count)
      end
    end

    context "when passwords do not match" do
      let(:mismatch_params) do
        {
          username: "catlover123",
          password: "password123",
          confirmPassword: "different123"
        }
      end

      it "returns 400 Bad Request" do
        post "/api/v1/auth/register", params: mismatch_params

        expect(response).to have_http_status(:bad_request)
      end

      it "returns VALIDATION_ERROR" do
        post "/api/v1/auth/register", params: mismatch_params

        json = JSON.parse(response.body)
        expect(json["success"]).to be false
        expect(json["error"]["code"]).to eq("VALIDATION_ERROR")
        expect(json["error"]["message"]).to eq("Las contraseñas no coinciden")
      end
    end

    context "with invalid username" do
      let(:invalid_params) do
        {
          username: "ab",
          password: "password123",
          confirmPassword: "password123"
        }
      end

      it "returns 400 Bad Request" do
        post "/api/v1/auth/register", params: invalid_params

        expect(response).to have_http_status(:bad_request)
      end

      it "returns validation errors" do
        post "/api/v1/auth/register", params: invalid_params

        json = JSON.parse(response.body)
        expect(json["success"]).to be false
        expect(json["error"]["code"]).to eq("VALIDATION_ERROR")
        expect(json["error"]["details"]).to be_present
      end
    end

    context "with short password" do
      let(:short_params) do
        {
          username: "catlover123",
          password: "short",
          confirmPassword: "short"
        }
      end

      it "returns 400 Bad Request" do
        post "/api/v1/auth/register", params: short_params

        expect(response).to have_http_status(:bad_request)
      end

      it "returns validation error for password" do
        post "/api/v1/auth/register", params: short_params

        json = JSON.parse(response.body)
        expect(json["success"]).to be false
        expect(json["error"]["code"]).to eq("VALIDATION_ERROR")
      end
    end

    context "with empty params" do
      it "returns 400 Bad Request" do
        post "/api/v1/auth/register", params: {}

        expect(response).to have_http_status(:bad_request)
      end
    end

    context "rate limiting" do
      before do
        Rack::Attack.reset!
      end

      it "allows up to 3 requests per hour" do
        3.times do |i|
          post "/api/v1/auth/register", params: {
            username: "user#{i}",
            password: "password123",
            confirmPassword: "password123"
          }
        end

        expect(response).not_to have_http_status(:too_many_requests)
      end

      it "blocks the 4th request within an hour" do
        3.times do |i|
          post "/api/v1/auth/register", params: {
            username: "user#{i}",
            password: "password123",
            confirmPassword: "password123"
          }
        end

        post "/api/v1/auth/register", params: {
          username: "user4",
          password: "password123",
          confirmPassword: "password123"
        }

        expect(response).to have_http_status(:too_many_requests)

        json = JSON.parse(response.body)
        expect(json["success"]).to be false
        expect(json["error"]["code"]).to eq("RATE_LIMIT_EXCEEDED")
        expect(json["error"]["message"]).to eq("Demasiadas solicitudes. Intente más tarde.")
      end

      it "includes Retry-After header" do
        4.times do |i|
          post "/api/v1/auth/register", params: {
            username: "user#{i}",
            password: "password123",
            confirmPassword: "password123"
          }
        end

        expect(response.headers["Retry-After"]).to be_present
      end
    end
  end

  describe "POST /api/v1/auth/login" do
    before { create(:user, username: "catlover123", password: "password123") }

    context "with valid credentials" do
      let(:valid_params) do
        {
          username: "catlover123",
          password: "password123"
        }
      end

      it "returns 200 OK" do
        post "/api/v1/auth/login", params: valid_params

        expect(response).to have_http_status(:ok)
      end

      it "returns success with token and user" do
        post "/api/v1/auth/login", params: valid_params

        json = JSON.parse(response.body)
        expect(json["success"]).to be true
        expect(json["data"]["token"]).to be_present
        expect(json["data"]["token"].split(".")).to have_attributes(size: 3)
        expect(json["data"]["user"]["id"]).to be_present
        expect(json["data"]["user"]["username"]).to eq("catlover123")
        expect(json["data"]["user"]).not_to have_key("password")
        expect(json["data"]["user"]).not_to have_key("password_digest")
      end
    end

    context "with wrong password" do
      let(:wrong_params) do
        {
          username: "catlover123",
          password: "wrongpassword"
        }
      end

      it "returns 401 Unauthorized" do
        post "/api/v1/auth/login", params: wrong_params

        expect(response).to have_http_status(:unauthorized)
      end

      it "returns INVALID_CREDENTIALS error" do
        post "/api/v1/auth/login", params: wrong_params

        json = JSON.parse(response.body)
        expect(json["success"]).to be false
        expect(json["error"]["code"]).to eq("INVALID_CREDENTIALS")
        expect(json["error"]["message"]).to eq("Credenciales incorrectas")
      end
    end

    context "with non-existent username" do
      let(:nonexistent_params) do
        {
          username: "nonexistent",
          password: "password123"
        }
      end

      it "returns 401 Unauthorized" do
        post "/api/v1/auth/login", params: nonexistent_params

        expect(response).to have_http_status(:unauthorized)
      end

      it "returns generic error (does not reveal if username exists)" do
        post "/api/v1/auth/login", params: nonexistent_params

        json = JSON.parse(response.body)
        expect(json["success"]).to be false
        expect(json["error"]["code"]).to eq("INVALID_CREDENTIALS")
        expect(json["error"]["message"]).to eq("Credenciales incorrectas")
      end
    end

    context "with empty params" do
      it "returns 401 Unauthorized" do
        post "/api/v1/auth/login", params: {}

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "rate limiting" do
      before { Rack::Attack.reset! }

      it "allows up to 5 requests per minute" do
        5.times do
          post "/api/v1/auth/login", params: {
            username: "catlover123",
            password: "wrongpassword"
          }
        end

        expect(response).not_to have_http_status(:too_many_requests)
      end

      it "blocks the 6th request within a minute" do
        5.times do
          post "/api/v1/auth/login", params: {
            username: "catlover123",
            password: "wrongpassword"
          }
        end

        post "/api/v1/auth/login", params: {
          username: "catlover123",
          password: "wrongpassword"
        }

        expect(response).to have_http_status(:too_many_requests)

        json = JSON.parse(response.body)
        expect(json["success"]).to be false
        expect(json["error"]["code"]).to eq("RATE_LIMIT_EXCEEDED")
      end
    end
  end

  describe "GET /api/v1/auth/me" do
    context "with valid token" do
      let(:user) { create(:user, username: "catlover123") }
      let(:token) { Auth::JwtService.new.encode(userId: user.id, username: user.username) }

      it "returns 200 OK" do
        get "/api/v1/auth/me", headers: { "Authorization" => "Bearer #{token}" }

        expect(response).to have_http_status(:ok)
      end

      it "returns success with user data" do
        get "/api/v1/auth/me", headers: { "Authorization" => "Bearer #{token}" }

        json = JSON.parse(response.body)
        expect(json["success"]).to be true
        expect(json["data"]["id"]).to eq(user.id)
        expect(json["data"]["username"]).to eq("catlover123")
        expect(json["data"]).not_to have_key("password")
        expect(json["data"]).not_to have_key("password_digest")
      end
    end

    context "with expired token" do
      let(:user) { create(:user, username: "catlover123") }

      it "returns 401 Unauthorized" do
        token = Auth::JwtService.new.encode(userId: user.id, username: user.username)
        travel_to 25.hours.from_now do
          get "/api/v1/auth/me", headers: { "Authorization" => "Bearer #{token}" }

          expect(response).to have_http_status(:unauthorized)
        end
      end
    end

    context "with invalid token" do
      it "returns 401 Unauthorized" do
        get "/api/v1/auth/me", headers: { "Authorization" => "Bearer invalid.token.here" }

        expect(response).to have_http_status(:unauthorized)
      end

      it "returns UNAUTHORIZED error" do
        get "/api/v1/auth/me", headers: { "Authorization" => "Bearer invalid.token.here" }

        json = JSON.parse(response.body)
        expect(json["success"]).to be false
        expect(json["error"]["code"]).to eq("UNAUTHORIZED")
      end
    end

    context "without token" do
      it "returns 401 Unauthorized" do
        get "/api/v1/auth/me"

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
