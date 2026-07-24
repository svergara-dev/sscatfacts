class FactSerializer
  def initialize(fact_data)
    @fact_data = fact_data
  end

  def as_json
    {
      id: @fact_data[:id],
      fact: @fact_data[:fact],
      length: @fact_data[:length],
      liked: @fact_data[:liked],
      likesCount: @fact_data[:likesCount]
    }
  end
end
