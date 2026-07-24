module Likes
  class LikeFact
    Result = Struct.new(:success?, :data, :error, keyword_init: true)

    def execute(user:, fact_id:)
      cat_fact = CatFact.find_by(id: fact_id)

      unless cat_fact
        return Result.new(
          success?: false,
          error: { code: "NOT_FOUND", message: "Fact no encontrado" }
        )
      end

      existing_like = UserLike.find_by(user: user, cat_fact: cat_fact)

      if existing_like
        return Result.new(
          success?: false,
          error: { code: "ALREADY_LIKED", message: "Ya has marcado like a este fact" }
        )
      end

      UserLike.create!(user: user, cat_fact: cat_fact)

      Result.new(
        success?: true,
        data: {
          liked: true,
          likesCount: cat_fact.likes_count
        }
      )
    end
  end
end
