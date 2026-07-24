require "rails_helper"

RSpec.describe Users::GetUserFavorites do
  subject(:use_case) { described_class.new }

  let(:user) { create(:user) }

  describe "#execute" do
    context "when user has favorites" do
      before do
        3.times do |i|
          fact = create(:cat_fact)
          create(:user_like, user: user, cat_fact: fact, created_at: Time.current - i.hours)
        end
      end

      it "returns paginated favorites" do
        result = use_case.execute(user: user, page: 1, limit: 10)

        expect(result.success?).to be true
        expect(result.data[:facts].size).to eq(3)
        expect(result.meta[:totalItems]).to eq(3)
        expect(result.meta[:currentPage]).to eq(1)
        expect(result.meta[:totalPages]).to eq(1)
      end

      it "orders by most recent first" do
        result = use_case.execute(user: user, page: 1, limit: 10)

        expect(result.success?).to be true
        dates = result.data[:facts].map { |f| Time.parse(f[:likedAt]) }
        expect(dates).to eq(dates.sort.reverse)
      end
    end

    context "when user has no favorites" do
      it "returns empty array" do
        result = use_case.execute(user: user, page: 1, limit: 10)

        expect(result.success?).to be true
        expect(result.data[:facts]).to be_empty
        expect(result.meta[:totalItems]).to eq(0)
      end
    end

    context "when paginating" do
      before do
        15.times do
          fact = create(:cat_fact)
          create(:user_like, user: user, cat_fact: fact)
        end
      end

      it "returns correct page" do
        result = use_case.execute(user: user, page: 2, limit: 10)

        expect(result.success?).to be true
        expect(result.data[:facts].size).to eq(5)
        expect(result.meta[:currentPage]).to eq(2)
        expect(result.meta[:totalPages]).to eq(2)
        expect(result.meta[:itemsPerPage]).to eq(10)
      end

      it "clamps limit to 50" do
        result = use_case.execute(user: user, page: 1, limit: 100)

        expect(result.meta[:itemsPerPage]).to eq(50)
      end
    end
  end
end
