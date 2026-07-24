require "rails_helper"

RSpec.describe Auth::LoginUser do
  subject(:use_case) { described_class.new }

  describe "#execute" do
    context "with valid credentials" do
      let!(:user) { create(:user, username: "catlover123", password: "password123") }

      it "returns success" do
        result = use_case.execute(username: "catlover123", password: "password123")

        expect(result.success?).to be true
      end

      it "returns a JWT token" do
        result = use_case.execute(username: "catlover123", password: "password123")

        expect(result.token).to be_a(String)
        expect(result.token.split(".")).to have_attributes(size: 3)
      end

      it "returns the user" do
        result = use_case.execute(username: "catlover123", password: "password123")

        expect(result.user).to eq(user)
        expect(result.user.username).to eq("catlover123")
      end

      it "encodes userId and username in token" do
        result = use_case.execute(username: "catlover123", password: "password123")
        decoded = JWT.decode(
          result.token,
          Auth::JwtService::SECRET_KEY,
          true,
          algorithm: Auth::JwtService::ALGORITHM
        )

        expect(decoded.first["userId"]).to eq(user.id)
        expect(decoded.first["username"]).to eq("catlover123")
      end
    end

    context "with wrong password" do
      before { create(:user, username: "catlover123", password: "password123") }

      it "returns failure" do
        result = use_case.execute(username: "catlover123", password: "wrongpassword")

        expect(result.success?).to be false
      end

      it "returns INVALID_CREDENTIALS error" do
        result = use_case.execute(username: "catlover123", password: "wrongpassword")

        expect(result.error[:code]).to eq("INVALID_CREDENTIALS")
        expect(result.error[:message]).to eq("Credenciales incorrectas")
      end

      it "does not return token" do
        result = use_case.execute(username: "catlover123", password: "wrongpassword")

        expect(result.token).to be_nil
      end
    end

    context "with non-existent username" do
      it "returns failure" do
        result = use_case.execute(username: "nonexistent", password: "password123")

        expect(result.success?).to be false
      end

      it "returns generic INVALID_CREDENTIALS error" do
        result = use_case.execute(username: "nonexistent", password: "password123")

        expect(result.error[:code]).to eq("INVALID_CREDENTIALS")
        expect(result.error[:message]).to eq("Credenciales incorrectas")
      end
    end

    context "with empty credentials" do
      it "returns failure for empty username" do
        result = use_case.execute(username: "", password: "password123")

        expect(result.success?).to be false
      end

      it "returns failure for empty password" do
        result = use_case.execute(username: "catlover123", password: "")

        expect(result.success?).to be false
      end
    end
  end
end
