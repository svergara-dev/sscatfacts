require "rails_helper"

RSpec.describe "Api::V1::Auth", type: :request do
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
  end
end
