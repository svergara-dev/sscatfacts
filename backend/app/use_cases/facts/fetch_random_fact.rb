module Facts
  class FetchRandomFact
    Result = Struct.new(:success?, :data, :error, keyword_init: true)

    def initialize(fact_service: FactService.new)
      @fact_service = fact_service
    end

    def execute(user:)
      result = @fact_service.fetch_random_for_user(user: user)

      if result[:success]
        Result.new(success?: true, data: result[:data])
      else
        Result.new(success?: false, error: result[:error])
      end
    end
  end
end
