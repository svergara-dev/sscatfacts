require "rails_helper"

RSpec.describe Auth::AuthService do
  subject(:service) { described_class.new }

  describe "#create_user" do
    context "with valid params" do
      it "creates a new user" do
        expect {
          service.create_user(username: "catlover123", password: "password123")
        }.to change(User, :count).by(1)
      end

      it "returns success with user" do
        result = service.create_user(username: "catlover123", password: "password123")

        expect(result[:success]).to be true
        expect(result[:user]).to be_a(User)
        expect(result[:user].username).to eq("catlover123")
      end

      it "hashes the password" do
        result = service.create_user(username: "catlover123", password: "password123")

        expect(result[:user].password_digest).not_to eq("password123")
        expect(result[:user].authenticate("password123")).to be_truthy
      end
    end

    context "with invalid params" do
      it "does not create user with short password" do
        expect {
          service.create_user(username: "catlover123", password: "short")
        }.not_to change(User, :count)
      end

      it "returns failure with errors" do
        result = service.create_user(username: "catlover123", password: "short")

        expect(result[:success]).to be false
        expect(result[:errors]).to be_present
      end

      it "does not create user with invalid username" do
        expect {
          service.create_user(username: "invalid-user!", password: "password123")
        }.not_to change(User, :count)
      end
    end

    context "with duplicate username" do
      before { create(:user, username: "catlover123") }

      it "does not create duplicate user" do
        expect {
          service.create_user(username: "catlover123", password: "password123")
        }.not_to change(User, :count)
      end

      it "returns failure" do
        result = service.create_user(username: "catlover123", password: "password123")

        expect(result[:success]).to be false
        expect(result[:errors]).to include("Username has already been taken")
      end
    end
  end

  describe "#username_exists?" do
    it "returns true when username exists" do
      create(:user, username: "catlover123")

      expect(service.username_exists?("catlover123")).to be true
    end

    it "returns false when username does not exist" do
      expect(service.username_exists?("nonexistent")).to be false
    end
  end

  describe "#authenticate_user" do
    context "with valid credentials" do
      before { create(:user, username: "catlover123", password: "password123") }

      it "returns success with user" do
        result = service.authenticate_user(username: "catlover123", password: "password123")

        expect(result[:success]).to be true
        expect(result[:user]).to be_a(User)
        expect(result[:user].username).to eq("catlover123")
      end
    end

    context "with wrong password" do
      before { create(:user, username: "catlover123", password: "password123") }

      it "returns failure" do
        result = service.authenticate_user(username: "catlover123", password: "wrongpassword")

        expect(result[:success]).to be false
      end
    end

    context "with non-existent username" do
      it "returns failure" do
        result = service.authenticate_user(username: "nonexistent", password: "password123")

        expect(result[:success]).to be false
      end
    end
  end
end
