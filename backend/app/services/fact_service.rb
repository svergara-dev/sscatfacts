class FactService
  def initialize(api_service: External::CatFactApiService.new)
    @api_service = api_service
  end

  def fetch_random_for_user(user:)
    external_fact = @api_service.fetch_random

    return { success: false, error: { code: "EXTERNAL_API_ERROR", message: "No se pudo obtener el cat fact. Intente más tarde." } } unless external_fact

    cat_fact = find_or_create_fact(external_fact)

    {
      success: true,
      data: {
        id: cat_fact.id,
        fact: cat_fact.fact_text,
        length: cat_fact.length,
        liked: cat_fact.liked_by?(user),
        likesCount: cat_fact.likes_count
      }
    }
  end

  def list_for_user(user:, page: 1, limit: 10)
    external_facts = @api_service.fetch_list(page: page, limit: limit)

    return { success: false, error: { code: "EXTERNAL_API_ERROR", message: "No se pudieron obtener los facts. Intente más tarde." } } unless external_facts

    facts = (external_facts["data"] || []).map do |ext_fact|
      cat_fact = find_or_create_fact(ext_fact)

      {
        id: cat_fact.id,
        fact: cat_fact.fact_text,
        length: cat_fact.length,
        liked: cat_fact.liked_by?(user),
        likesCount: cat_fact.likes_count
      }
    end

    {
      success: true,
      data: {
        facts: facts
      },
      meta: {
        currentPage: external_facts["current_page"] || page,
        totalPages: external_facts["last_page"] || 1,
        totalItems: external_facts["total"] || facts.size,
        itemsPerPage: external_facts["per_page"] || limit
      }
    }
  end

  private

  def find_or_create_fact(external_fact)
    fact_text = external_fact[:fact] || external_fact["fact"]
    fact_length = external_fact[:length] || external_fact["length"]

    cat_fact = CatFact.find_by(fact_text: fact_text)

    return cat_fact if cat_fact

    CatFact.create!(
      fact_text: fact_text,
      length: fact_length,
      api_fact_id: Digest::MD5.hexdigest(fact_text)
    )
  end
end
