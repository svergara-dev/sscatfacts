module Likes
  class UnlikeFact
    Result = Struct.new(:success?, :data, :error, keyword_init: true)

    def execute(user:, fact_id:)
      cat_fact = CatFact.find_by(id: fact_id)

      unless cat_fact
        return Result.new(
          success?: false,
          error: { code: "NOT_FOUND", message: "Fact no encontrado" }
        )
      end

      like = UserLike.find_by(user: user, cat_fact: cat_fact)

      unless like
        return Result.new(
          success?: false,
          error: { code: "LIKE_NOT_FOUND", message: "No tienes like en este fact" }
        )
      end

      like.destroy

      Result.new(
        success?: true,
        data: {
          liked: false,
          likesCount: cat_fact.likes_count
        }
      )
    end
  end
end
