require "rails_helper"

RSpec.describe FactSerializer do
  describe "#as_json" do
    let(:fact_data) do
      {
        id: 1,
        fact: "Cats have over 20 vocalizations",
        length: 38,
        liked: true,
        likesCount: 42
      }
    end

    subject(:serializer) { described_class.new(fact_data) }

    it "returns serialized fact" do
      result = serializer.as_json

      expect(result).to eq(
        id: 1,
        fact: "Cats have over 20 vocalizations",
        length: 38,
        liked: true,
        likesCount: 42
      )
    end
  end
end
