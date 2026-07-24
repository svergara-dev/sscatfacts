class CatFact < ApplicationRecord
  has_many :user_likes, dependent: :destroy

  validates :fact_text, presence: true
  validates :api_fact_id, uniqueness: true, allow_nil: true

  def likes_count
    user_likes.count
  end

  def liked_by?(user)
    return false unless user

    user_likes.exists?(user_id: user.id)
  end
end
