require "rails_helper"

RSpec.describe CatFact, type: :model do
  describe "associations" do
    it { is_expected.to have_many(:user_likes).dependent(:destroy) }
  end

  describe "validations" do
    subject { build(:cat_fact) }

    it { is_expected.to be_valid }

    it "requires fact_text" do
      subject.fact_text = nil
      expect(subject).not_to be_valid
      expect(subject.errors[:fact_text]).to include("can't be blank")
    end

    it "validates uniqueness of api_fact_id" do
      create(:cat_fact, api_fact_id: "unique_123")
      subject.api_fact_id = "unique_123"
      expect(subject).not_to be_valid
      expect(subject.errors[:api_fact_id]).to include("has already been taken")
    end

    it "allows nil api_fact_id" do
      subject.api_fact_id = nil
      expect(subject).to be_valid
    end
  end

  describe "#likes_count" do
    let(:cat_fact) { create(:cat_fact) }

    it "returns 0 when no likes" do
      expect(cat_fact.likes_count).to eq(0)
    end

    it "returns correct count with likes" do
      create_list(:user_like, 3, cat_fact: cat_fact)
      expect(cat_fact.likes_count).to eq(3)
    end
  end

  describe "#liked_by?" do
    let(:cat_fact) { create(:cat_fact) }
    let(:user) { create(:user) }

    it "returns false when user has not liked" do
      expect(cat_fact.liked_by?(user)).to be false
    end

    it "returns true when user has liked" do
      create(:user_like, user: user, cat_fact: cat_fact)
      expect(cat_fact.liked_by?(user)).to be true
    end

    it "returns false when user is nil" do
      expect(cat_fact.liked_by?(nil)).to be false
    end
  end
end
