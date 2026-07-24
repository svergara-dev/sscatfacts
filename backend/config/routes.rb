Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      post "auth/register", to: "auth#register"
      post "auth/login", to: "auth#login"
      get "auth/me", to: "auth#me"

      get "facts/random", to: "facts#random"
      get "facts/list", to: "facts#list"
      post "facts/:id/like", to: "facts#like"
      delete "facts/:id/like", to: "facts#unlike"
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check
end
