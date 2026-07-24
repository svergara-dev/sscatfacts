Rails.application.config.after_initialize do
  Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new
end
