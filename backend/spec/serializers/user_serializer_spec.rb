require "rails_helper"

RSpec.describe UserSerializer do
  subject(:serializer) { described_class.new(user) }

  let(:user) { create(:user, username: "catlover123") }

  describe "#as_json" do
    it "returns id, username, and createdAt" do
      json = serializer.as_json

      expect(json[:id]).to eq(user.id)
      expect(json[:username]).to eq("catlover123")
      expect(json[:createdAt]).to eq(user.created_at.iso8601)
    end

    it "does not include password or password_digest" do
      json = serializer.as_json

      expect(json).not_to have_key(:password)
      expect(json).not_to have_key(:password_digest)
    end
  end
end
