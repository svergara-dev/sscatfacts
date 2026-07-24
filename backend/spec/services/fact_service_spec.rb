require "rails_helper"

RSpec.describe FactService do
  subject(:service) { described_class.new(api_service: api_service) }

  let(:api_service) { instance_double(External::CatFactApiService) }
  let(:user) { create(:user) }

  before { Rails.cache.clear }

  describe "#fetch_random_for_user" do
    context "when API succeeds" do
      before do
        allow(api_service).to receive(:fetch_random).and_return(
          { "fact" => "Cats sleep 16 hours a day", "length" => 29 }
        )
      end

      it "returns success with fact data" do
        result = service.fetch_random_for_user(user: user)

        expect(result[:success]).to be true
        expect(result[:data][:fact]).to eq("Cats sleep 16 hours a day")
        expect(result[:data][:liked]).to be false
        expect(result[:data][:likesCount]).to eq(0)
      end

      it "creates cat_fact in database" do
        expect { service.fetch_random_for_user(user: user) }
          .to change(CatFact, :count).by(1)
      end

      it "returns existing fact if already cached" do
        create(:cat_fact, fact_text: "Cats sleep 16 hours a day")

        expect { service.fetch_random_for_user(user: user) }
          .not_to change(CatFact, :count)
      end

      it "returns liked status when user has liked" do
        cat_fact = create(:cat_fact, fact_text: "Cats sleep 16 hours a day")
        create(:user_like, user: user, cat_fact: cat_fact)

        result = service.fetch_random_for_user(user: user)

        expect(result[:data][:liked]).to be true
        expect(result[:data][:likesCount]).to eq(1)
      end
    end

    context "when API fails" do
      before do
        allow(api_service).to receive(:fetch_random).and_return(nil)
      end

      it "returns error" do
        result = service.fetch_random_for_user(user: user)

        expect(result[:success]).to be false
        expect(result[:error][:code]).to eq("EXTERNAL_API_ERROR")
      end
    end
  end

  describe "#list_for_user" do
    context "when API succeeds" do
      before do
        allow(api_service).to receive(:fetch_list).and_return(
          {
            "data" => [
              { "fact" => "Fact 1", "length" => 7 },
              { "fact" => "Fact 2", "length" => 7 }
            ],
            "current_page" => 1,
            "last_page" => 5,
            "total" => 50,
            "per_page" => 10
          }
        )
      end

      it "returns paginated facts" do
        result = service.list_for_user(user: user, page: 1, limit: 10)

        expect(result[:success]).to be true
        expect(result[:data][:facts].size).to eq(2)
        expect(result[:meta][:currentPage]).to eq(1)
        expect(result[:meta][:totalPages]).to eq(5)
      end

      it "creates facts in database" do
        expect { service.list_for_user(user: user, page: 1, limit: 10) }
          .to change(CatFact, :count).by(2)
      end
    end

    context "when API fails" do
      before do
        allow(api_service).to receive(:fetch_list).and_return(nil)
      end

      it "returns error" do
        result = service.list_for_user(user: user, page: 1, limit: 10)

        expect(result[:success]).to be false
        expect(result[:error][:code]).to eq("EXTERNAL_API_ERROR")
      end
    end
  end
end
