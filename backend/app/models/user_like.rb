class UserLike < ApplicationRecord
  belongs_to :user
  belongs_to :cat_fact

  validates :user_id, uniqueness: { scope: :cat_fact_id, message: "ya marcó like a este fact" }
end
