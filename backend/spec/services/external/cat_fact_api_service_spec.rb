require "rails_helper"

RSpec.describe External::CatFactApiService do
  subject(:service) { described_class.new }

  let(:connection) { instance_double(Faraday::Connection) }

  before do
    Rails.cache.clear
    allow(Faraday).to receive(:new).and_return(connection)
    allow(connection).to receive(:get).and_return(
      instance_double(
        Faraday::Response,
        status: 200,
        body: '{"fact":"Cats have over 20 vocalizations","length":38}'
      )
    )
  end

  describe "#fetch_random" do
    it "returns fact data on success" do
      result = service.fetch_random

      expect(result).to eq({ fact: "Cats have over 20 vocalizations", length: 38 })
    end

    it "returns nil on HTTP error" do
      allow(connection).to receive(:get).and_return(
        instance_double(Faraday::Response, status: 500, body: "error")
      )

      result = service.fetch_random
      expect(result).to be_nil
    end

    it "retries on Faraday error" do
      call_count = 0
      allow(connection).to receive(:get) do
        call_count += 1
        raise Faraday::ConnectionFailed.new("connection refused") if call_count < 3

        instance_double(Faraday::Response, status: 200, body: '{"fact":"test","length":4}')
      end

      result = service.fetch_random
      expect(result).to eq({ fact: "test", length: 4 })
    end

    it "returns nil after max retries" do
      allow(connection).to receive(:get).and_raise(Faraday::ConnectionFailed.new("fail"))

      result = service.fetch_random
      expect(result).to be_nil
    end
  end

  describe "#fetch_list" do
    before do
      allow(connection).to receive(:get).and_return(
        instance_double(
          Faraday::Response,
          status: 200,
          body: {
            "data" => [
              { "fact" => "Fact 1", "length" => 7 },
              { "fact" => "Fact 2", "length" => 7 }
            ],
            "current_page" => 1,
            "last_page" => 5,
            "total" => 50,
            "per_page" => 10
          }.to_json
        )
      )
    end

    it "returns paginated facts" do
      result = service.fetch_list(page: 1, limit: 10)

      expect(result[:data].size).to eq(2)
      expect(result[:current_page]).to eq(1)
      expect(result[:total]).to eq(50)
    end

    it "returns nil on error" do
      allow(connection).to receive(:get).and_return(
        instance_double(Faraday::Response, status: 500, body: "error")
      )

      result = service.fetch_list(page: 1, limit: 10)
      expect(result).to be_nil
    end
  end
end
