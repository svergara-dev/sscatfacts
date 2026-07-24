require "rails_helper"

RSpec.describe Facts::ListFacts do
  subject(:use_case) { described_class.new(fact_service: fact_service) }

  let(:fact_service) { instance_double(FactService) }
  let(:user) { create(:user) }

  describe "#execute" do
    context "when service succeeds" do
      before do
        allow(fact_service).to receive(:list_for_user).and_return(
          {
            success: true,
            data: { facts: [ { id: 1, fact: "Fact 1", length: 7, liked: false, likesCount: 0 } ] },
            meta: { currentPage: 1, totalPages: 5, totalItems: 50, itemsPerPage: 10 }
          }
        )
      end

      it "returns success with facts and meta" do
        result = use_case.execute(user: user, page: 1, limit: 10)

        expect(result.success?).to be true
        expect(result.data[:facts].size).to eq(1)
        expect(result.meta[:currentPage]).to eq(1)
      end
    end

    context "when service fails" do
      before do
        allow(fact_service).to receive(:list_for_user).and_return(
          {
            success: false,
            error: { code: "EXTERNAL_API_ERROR", message: "API unavailable" }
          }
        )
      end

      it "returns error result" do
        result = use_case.execute(user: user, page: 1, limit: 10)

        expect(result.success?).to be false
        expect(result.error[:code]).to eq("EXTERNAL_API_ERROR")
      end
    end
  end
end
