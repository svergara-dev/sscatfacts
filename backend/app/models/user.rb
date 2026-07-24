class User < ApplicationRecord
  has_secure_password

  has_many :user_likes, dependent: :destroy

  validates :username,
            presence: true,
            uniqueness: true,
            length: { minimum: 3, maximum: 30 },
            format: { with: /\A[a-zA-Z0-9_]+\z/, message: "solo puede contener letras, números y guiones bajos" }

  validates :password,
            length: { minimum: 8 },
            if: :password_required?

  private

  def password_required?
    new_record? || password.present?
  end
end
