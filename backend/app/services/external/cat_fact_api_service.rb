require "faraday"

module External
  class CatFactApiService
    BASE_URL = "https://catfact.ninja"
    MAX_RETRIES = 3
    CACHE_TTL = 5.minutes

    def initialize
      @connection = ::Faraday.new(url: BASE_URL) do |f|
        f.request :url_encoded
        f.adapter ::Faraday.default_adapter
        f.options.timeout = 5
        f.options.open_timeout = 5
      end
    end

    def fetch_random
      cache_key = "cat_fact_random_#{Time.current.to_i / 60}"

      Rails.cache.fetch(cache_key, expires_in: CACHE_TTL) do
        response = request_with_retries("/fact")
        return nil unless response

        { fact: response["fact"], length: response["length"] }
      end
    end

    def fetch_list(page: 1, limit: 10)
      cache_key = "cat_fact_list_#{page}_#{limit}_#{Time.current.to_i / 300}"

      Rails.cache.fetch(cache_key, expires_in: CACHE_TTL) do
        response = request_with_retries("/facts", page: page, limit: limit)
        return nil unless response

        {
          data: response["data"] || [],
          current_page: response["current_page"],
          last_page: response["last_page"],
          total: response["total"],
          per_page: response["per_page"]
        }
      end
    end

    private

    def request_with_retries(path, params = {})
      retries = 0

      begin
        response = @connection.get(path, params)

        if response.status == 200
          JSON.parse(response.body)
        else
          Rails.logger.error("CatFactApiService: HTTP #{response.status} for #{path}")
          nil
        end
      rescue ::Faraday::Error, JSON::ParserError => e
        retries += 1
        Rails.logger.warn("CatFactApiService: Retry #{retries}/#{MAX_RETRIES} for #{path}: #{e.message}")

        retry if retries < MAX_RETRIES

        Rails.logger.error("CatFactApiService: Failed after #{MAX_RETRIES} retries for #{path}: #{e.message}")
        nil
      end
    end
  end
end
