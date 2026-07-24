require "rails_helper"

RSpec.describe "Api::V1::Users", type: :request do
  let(:user) { create(:user) }
  let(:token) { Auth::JwtService.new.encode(userId: user.id, username: user.username) }
  let(:headers) { { "Authorization" => "Bearer #{token}" } }

  before { Rack::Attack.reset! }

  describe "GET /api/v1/users/favorites" do
    context "with valid token" do
      before do
        3.times do
          fact = create(:cat_fact)
          create(:user_like, user: user, cat_fact: fact)
        end
      end

      it "returns paginated favorites" do
        get "/api/v1/users/favorites", params: { page: 1, limit: 10 }, headers: headers

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json["success"]).to be true
        expect(json["data"]["facts"].size).to eq(3)
        expect(json["meta"]["totalItems"]).to eq(3)
      end
    end

    context "without token" do
      it "returns 401" do
        get "/api/v1/users/favorites"

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when user has no favorites" do
      it "returns empty array" do
        get "/api/v1/users/favorites", headers: headers

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json["success"]).to be true
        expect(json["data"]["facts"]).to be_empty
      end
    end
  end

  describe "DELETE /api/v1/users/favorites/:factId" do
    let(:cat_fact) { create(:cat_fact) }

    context "when user has the favorite" do
      before { create(:user_like, user: user, cat_fact: cat_fact) }

      it "removes the favorite and returns success" do
        delete "/api/v1/users/favorites/#{cat_fact.id}", headers: headers

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json["success"]).to be true
        expect(json["data"]["message"]).to eq("Fact eliminado de favoritos")
      end
    end

    context "when user does not have the favorite" do
      it "returns 404 FAVORITE_NOT_FOUND" do
        delete "/api/v1/users/favorites/#{cat_fact.id}", headers: headers

        expect(response).to have_http_status(:not_found)
        json = JSON.parse(response.body)
        expect(json["error"]["code"]).to eq("FAVORITE_NOT_FOUND")
      end
    end

    context "when fact does not exist" do
      it "returns 404 NOT_FOUND" do
        delete "/api/v1/users/favorites/0", headers: headers

        expect(response).to have_http_status(:not_found)
        json = JSON.parse(response.body)
        expect(json["error"]["code"]).to eq("NOT_FOUND")
      end
    end
  end
end
