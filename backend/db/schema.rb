# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_07_24_170633) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "cat_facts", force: :cascade do |t|
    t.string "api_fact_id", limit: 50
    t.datetime "created_at", null: false
    t.text "fact_text", null: false
    t.integer "length"
    t.datetime "updated_at", null: false
    t.index ["api_fact_id"], name: "index_cat_facts_on_api_fact_id", unique: true
  end

  create_table "user_likes", force: :cascade do |t|
    t.bigint "cat_fact_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["cat_fact_id"], name: "index_user_likes_on_cat_fact_id"
    t.index ["user_id", "cat_fact_id"], name: "index_user_likes_on_user_id_and_cat_fact_id", unique: true
    t.index ["user_id"], name: "index_user_likes_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "password_digest", null: false
    t.datetime "updated_at", null: false
    t.string "username", limit: 30, null: false
    t.index ["username"], name: "index_users_on_username", unique: true
  end

  add_foreign_key "user_likes", "cat_facts"
  add_foreign_key "user_likes", "users"
end
