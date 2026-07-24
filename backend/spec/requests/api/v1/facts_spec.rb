require "rails_helper"

RSpec.describe "Api::V1::Facts", type: :request do
  let(:user) { create(:user) }
  let(:token) { Auth::JwtService.new.encode(userId: user.id, username: user.username) }
  let(:headers) { { "Authorization" => "Bearer #{token}" } }

  before do
    Rack::Attack.reset!
    allow_any_instance_of(External::CatFactApiService).to receive(:fetch_random).and_return(
      { "fact" => "Cats have over 20 vocalizations", "length" => 38 }
    )
    allow_any_instance_of(External::CatFactApiService).to receive(:fetch_list).and_return(
      {
        "data" => [
          { "fact" => "Fact 1", "length" => 7 },
          { "fact" => "Fact 2", "length" => 7 }
        ],
        "current_page" => 1,
        "last_page" => 5,
        "total" => 50,
        "per_page" => 10
      }
    )
  end

  describe "GET /api/v1/facts/random" do
    context "with valid token" do
      it "returns fact with liked status" do
        get "/api/v1/facts/random", headers: headers

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json["success"]).to be true
        expect(json["data"]["fact"]).to eq("Cats have over 20 vocalizations")
        expect(json["data"]["liked"]).to be false
        expect(json["data"]["likesCount"]).to eq(0)
      end
    end

    context "without token" do
      it "returns 401" do
        get "/api/v1/facts/random"

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when API is unavailable" do
      before do
        allow_any_instance_of(External::CatFactApiService).to receive(:fetch_random).and_return(nil)
      end

      it "returns 503" do
        get "/api/v1/facts/random", headers: headers

        expect(response).to have_http_status(:service_unavailable)
        json = JSON.parse(response.body)
        expect(json["error"]["code"]).to eq("EXTERNAL_API_ERROR")
      end
    end
  end

  describe "GET /api/v1/facts/list" do
    context "with valid token" do
      it "returns paginated facts" do
        get "/api/v1/facts/list", params: { page: 1, limit: 10 }, headers: headers

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json["success"]).to be true
        expect(json["data"]["facts"].size).to eq(2)
        expect(json["meta"]["currentPage"]).to eq(1)
      end
    end

    context "without token" do
      it "returns 401" do
        get "/api/v1/facts/list"

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "POST /api/v1/facts/:id/like" do
    let(:cat_fact) { create(:cat_fact) }

    context "with valid token and fact exists" do
      it "creates like and returns success" do
        post "/api/v1/facts/#{cat_fact.id}/like", headers: headers

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json["success"]).to be true
        expect(json["data"]["liked"]).to be true
        expect(json["data"]["likesCount"]).to eq(1)
      end
    end

    context "when user already liked" do
      before { create(:user_like, user: user, cat_fact: cat_fact) }

      it "returns 409 ALREADY_LIKED" do
        post "/api/v1/facts/#{cat_fact.id}/like", headers: headers

        expect(response).to have_http_status(:conflict)
        json = JSON.parse(response.body)
        expect(json["error"]["code"]).to eq("ALREADY_LIKED")
      end
    end

    context "when fact does not exist" do
      it "returns 404" do
        post "/api/v1/facts/0/like", headers: headers

        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "DELETE /api/v1/facts/:id/like" do
    let(:cat_fact) { create(:cat_fact) }

    context "when user has liked" do
      before { create(:user_like, user: user, cat_fact: cat_fact) }

      it "removes like and returns success" do
        delete "/api/v1/facts/#{cat_fact.id}/like", headers: headers

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json["success"]).to be true
        expect(json["data"]["liked"]).to be false
        expect(json["data"]["likesCount"]).to eq(0)
      end
    end

    context "when user has not liked" do
      it "returns 404 LIKE_NOT_FOUND" do
        delete "/api/v1/facts/#{cat_fact.id}/like", headers: headers

        expect(response).to have_http_status(:not_found)
        json = JSON.parse(response.body)
        expect(json["error"]["code"]).to eq("LIKE_NOT_FOUND")
      end
    end
  end
end
