require "rails_helper"

RSpec.describe ErrorSerializer do
  describe "#as_json" do
    context "without details" do
      subject(:serializer) { described_class.new(code: "USER_EXISTS", message: "User exists") }

      it "returns success false with error code and message" do
        json = serializer.as_json

        expect(json[:success]).to be false
        expect(json[:error][:code]).to eq("USER_EXISTS")
        expect(json[:error][:message]).to eq("User exists")
        expect(json[:error]).not_to have_key(:details)
      end
    end

    context "with details" do
      subject(:serializer) do
        described_class.new(
          code: "VALIDATION_ERROR",
          message: "Invalid",
          details: [ { message: "too short" } ]
        )
      end

      it "includes details in the error" do
        json = serializer.as_json

        expect(json[:success]).to be false
        expect(json[:error][:details]).to eq([ { message: "too short" } ])
      end
    end
  end
end
