module Users
  class GetUserFavorites
    Result = Struct.new(:success?, :data, :meta, :error, keyword_init: true)

    def execute(user:, page: 1, limit: 10)
      limit = [ limit.to_i, 50 ].min
      limit = 10 if limit < 1
      page = page.to_i
      page = 1 if page < 1

      total_items = UserLike.where(user: user).count
      total_pages = (total_items.to_f / limit).ceil
      total_pages = 1 if total_pages < 1

      likes = UserLike
        .where(user: user)
        .joins(:cat_fact)
        .select("cat_facts.id, cat_facts.fact_text, cat_facts.length, user_likes.created_at AS liked_at")
        .order("user_likes.created_at DESC")
        .limit(limit)
        .offset((page - 1) * limit)

      facts = likes.map do |like|
        {
          id: like.id,
          fact: like.fact_text,
          length: like.length,
          likedAt: like.liked_at.iso8601
        }
      end

      Result.new(
        success?: true,
        data: { facts: facts },
        meta: {
          currentPage: page,
          totalPages: total_pages,
          totalItems: total_items,
          itemsPerPage: limit
        }
      )
    end
  end
end
