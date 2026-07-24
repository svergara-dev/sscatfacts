module Facts
  class ListFacts
    Result = Struct.new(:success?, :data, :meta, :error, keyword_init: true)

    def initialize(fact_service: FactService.new)
      @fact_service = fact_service
    end

    def execute(user:, page: 1, limit: 10)
      result = @fact_service.list_for_user(user: user, page: page, limit: limit)

      if result[:success]
        Result.new(success?: true, data: result[:data], meta: result[:meta])
      else
        Result.new(success?: false, error: result[:error])
      end
    end
  end
end
