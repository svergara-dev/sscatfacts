require "rails_helper"

RSpec.describe User, type: :model do
  describe "validations" do
    subject { build(:user) }

    it { is_expected.to be_valid }

    it "requires username" do
      subject.username = nil
      expect(subject).not_to be_valid
      expect(subject.errors[:username]).to include("can't be blank")
    end

    it "requires unique username" do
      create(:user, username: "taken_name")
      subject.username = "taken_name"
      expect(subject).not_to be_valid
      expect(subject.errors[:username]).to include("has already been taken")
    end

    it "requires username between 3 and 30 characters" do
      subject.username = "ab"
      expect(subject).not_to be_valid
      expect(subject.errors[:username]).to include("is too short (minimum is 3 characters)")

      subject.username = "a" * 31
      expect(subject).not_to be_valid
      expect(subject.errors[:username]).to include("is too long (maximum is 30 characters)")
    end

    it "requires username to be alphanumeric with underscores only" do
      subject.username = "invalid-user!"
      expect(subject).not_to be_valid
      expect(subject.errors[:username]).to include("solo puede contener letras, números y guiones bajos")
    end

    it "allows valid usernames" do
      %w[user_123 cat_lover test_user A1B2C3].each do |valid_name|
        subject.username = valid_name
        expect(subject).to be_valid
      end
    end

    it "requires password on create" do
      subject.password = nil
      expect(subject).not_to be_valid
    end

    it "requires password minimum 8 characters" do
      subject.password = "short"
      subject.password_confirmation = "short"
      expect(subject).not_to be_valid
      expect(subject.errors[:password]).to include("is too short (minimum is 8 characters)")
    end

    it "does not require password on update when not changing it" do
      user = create(:user)
      user.username = "new_username"
      expect(user).to be_valid
    end
  end

  describe "has_secure_password" do
    it "authenticates with correct password" do
      user = create(:user, password: "password123", password_confirmation: "password123")
      expect(user.authenticate("password123")).to eq(user)
    end

    it "rejects incorrect password" do
      user = create(:user, password: "password123", password_confirmation: "password123")
      expect(user.authenticate("wrong")).to be_falsey
    end

    it "does not store plaintext password" do
      user = create(:user, password: "password123", password_confirmation: "password123")
      expect(user.password_digest).not_to eq("password123")
      expect(user.password_digest).to be_present
    end
  end
end
