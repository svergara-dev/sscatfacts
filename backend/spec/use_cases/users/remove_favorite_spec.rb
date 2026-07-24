require "rails_helper"

RSpec.describe Users::RemoveFavorite do
  subject(:use_case) { described_class.new }

  let(:user) { create(:user) }
  let(:cat_fact) { create(:cat_fact) }

  describe "#execute" do
    context "when user has the favorite" do
      before { create(:user_like, user: user, cat_fact: cat_fact) }

      it "removes the favorite and returns success" do
        expect {
          result = use_case.execute(user: user, fact_id: cat_fact.id)
          expect(result.success?).to be true
          expect(result.data[:message]).to eq("Fact eliminado de favoritos")
        }.to change(UserLike, :count).by(-1)
      end
    end

    context "when user does not have the favorite" do
      it "returns FAVORITE_NOT_FOUND error" do
        result = use_case.execute(user: user, fact_id: cat_fact.id)

        expect(result.success?).to be false
        expect(result.error[:code]).to eq("FAVORITE_NOT_FOUND")
      end
    end

    context "when fact does not exist" do
      it "returns NOT_FOUND error" do
        result = use_case.execute(user: user, fact_id: 0)

        expect(result.success?).to be false
        expect(result.error[:code]).to eq("NOT_FOUND")
      end
    end
  end
end
