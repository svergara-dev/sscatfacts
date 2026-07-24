require "rails_helper"

RSpec.describe Facts::FetchRandomFact do
  subject(:use_case) { described_class.new(fact_service: fact_service) }

  let(:fact_service) { instance_double(FactService) }
  let(:user) { create(:user) }

  describe "#execute" do
    context "when service succeeds" do
      before do
        allow(fact_service).to receive(:fetch_random_for_user).with(user: user).and_return(
          {
            success: true,
            data: { id: 1, fact: "Cats are amazing", length: 18, liked: false, likesCount: 0 }
          }
        )
      end

      it "returns success result" do
        result = use_case.execute(user: user)

        expect(result.success?).to be true
        expect(result.data[:fact]).to eq("Cats are amazing")
      end
    end

    context "when service fails" do
      before do
        allow(fact_service).to receive(:fetch_random_for_user).with(user: user).and_return(
          {
            success: false,
            error: { code: "EXTERNAL_API_ERROR", message: "API unavailable" }
          }
        )
      end

      it "returns error result" do
        result = use_case.execute(user: user)

        expect(result.success?).to be false
        expect(result.error[:code]).to eq("EXTERNAL_API_ERROR")
      end
    end
  end
end
