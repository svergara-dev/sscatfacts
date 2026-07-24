require "rails_helper"

RSpec.describe UserLike, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to belong_to(:cat_fact) }
  end

  describe "validations" do
    subject { build(:user_like) }

    it { is_expected.to be_valid }

    it "prevents duplicate likes" do
      create(:user_like, user: subject.user, cat_fact: subject.cat_fact)
      duplicate = build(:user_like, user: subject.user, cat_fact: subject.cat_fact)
      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:user_id]).to include("ya marcó like a este fact")
    end
  end
end
