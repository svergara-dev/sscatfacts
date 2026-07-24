require "rails_helper"

RSpec.describe Auth::JwtService do
  include ActiveSupport::Testing::TimeHelpers

  subject(:service) { described_class.new }

  describe "#encode" do
    it "returns a string token" do
      token = service.encode(userId: 1, username: "catlover123")

      expect(token).to be_a(String)
      expect(token.split(".")).to have_attributes(size: 3)
    end

    it "includes iat and exp in payload" do
      token = service.encode(userId: 1, username: "catlover123")
      decoded = JWT.decode(token, described_class::SECRET_KEY, true, algorithm: described_class::ALGORITHM)

      expect(decoded.first["iat"]).to be_present
      expect(decoded.first["exp"]).to be_present
    end

    it "sets expiration 24 hours from now" do
      token = service.encode(userId: 1, username: "catlover123")
      decoded = JWT.decode(token, described_class::SECRET_KEY, true, algorithm: described_class::ALGORITHM)
      exp_time = Time.at(decoded.first["exp"])

      expect(exp_time).to be_within(2.seconds).of(24.hours.from_now)
    end
  end

  describe "#decode" do
    context "with valid token" do
      it "returns decoded payload" do
        token = service.encode(userId: 1, username: "catlover123")
        result = service.decode(token)

        expect(result[:userId]).to eq(1)
        expect(result[:username]).to eq("catlover123")
      end
    end

    context "with expired token" do
      it "returns nil" do
        token = service.encode(userId: 1, username: "catlover123")
        travel_to 25.hours.from_now do
          result = service.decode(token)
          expect(result).to be_nil
        end
      end
    end

    context "with invalid token" do
      it "returns nil" do
        result = service.decode("invalid.token.here")

        expect(result).to be_nil
      end
    end

    context "with token signed with different key" do
      it "returns nil" do
        payload = { userId: 1, username: "catlover123", exp: 24.hours.from_now.to_i }
        wrong_token = JWT.encode(payload, "wrong_secret_key", described_class::ALGORITHM)

        result = service.decode(wrong_token)

        expect(result).to be_nil
      end
    end
  end
end
