FactoryBot.define do
  factory :cat_fact do
    sequence(:fact_text) { |n| "Cats have #{n} vocalizations including the purr." }
    length { 50 }
    sequence(:api_fact_id) { |n| "ext_#{n}" }
  end
end
