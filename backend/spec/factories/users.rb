FactoryBot.define do
  factory :user do
    sequence(:username) { |n| "user_#{n}" }
    password { "password123" }
    password_confirmation { "password123" }
  end
end
