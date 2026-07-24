Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      post "auth/register", to: "auth#register"
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check
end
