require "rails_helper"

RSpec.describe Auth::RegisterUser do
  subject(:use_case) { described_class.new }

  describe "#execute" do
    context "with valid params" do
      it "creates a user and returns success" do
        result = use_case.execute(
          username: "catlover123",
          password: "password123",
          password_confirmation: "password123"
        )

        expect(result.success?).to be true
        expect(result.user).to be_a(User)
        expect(result.user.username).to eq("catlover123")
      end

      it "returns a user object" do
        result = use_case.execute(
          username: "catlover123",
          password: "password123",
          password_confirmation: "password123"
        )

        expect(result.user).to be_a(User)
        expect(result.user.password_digest).to be_present
      end
    end

    context "when passwords do not match" do
      it "returns validation error" do
        result = use_case.execute(
          username: "catlover123",
          password: "password123",
          password_confirmation: "different123"
        )

        expect(result.success?).to be false
        expect(result.error[:code]).to eq("VALIDATION_ERROR")
        expect(result.error[:message]).to eq("Las contraseñas no coinciden")
      end

      it "does not create user" do
        expect {
          use_case.execute(
            username: "catlover123",
            password: "password123",
            password_confirmation: "different123"
          )
        }.not_to change(User, :count)
      end
    end

    context "when username already exists" do
      before { create(:user, username: "catlover123") }

      it "returns user exists error" do
        result = use_case.execute(
          username: "catlover123",
          password: "password123",
          password_confirmation: "password123"
        )

        expect(result.success?).to be false
        expect(result.error[:code]).to eq("USER_EXISTS")
        expect(result.error[:message]).to eq("El nombre de usuario ya está registrado")
      end

      it "does not create duplicate user" do
        expect {
          use_case.execute(
            username: "catlover123",
            password: "password123",
            password_confirmation: "password123"
          )
        }.not_to change(User, :count)
      end
    end

    context "with invalid username format" do
      it "returns validation error" do
        result = use_case.execute(
          username: "invalid-user!",
          password: "password123",
          password_confirmation: "password123"
        )

        expect(result.success?).to be false
        expect(result.error[:code]).to eq("VALIDATION_ERROR")
        expect(result.error[:details]).to be_present
      end
    end

    context "with short password" do
      it "returns validation error" do
        result = use_case.execute(
          username: "catlover123",
          password: "short",
          password_confirmation: "short"
        )

        expect(result.success?).to be false
        expect(result.error[:code]).to eq("VALIDATION_ERROR")
      end
    end
  end
end
