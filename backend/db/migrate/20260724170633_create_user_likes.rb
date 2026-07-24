class CreateUserLikes < ActiveRecord::Migration[8.1]
  def change
    create_table :user_likes do |t|
      t.references :user, null: false, foreign_key: true
      t.references :cat_fact, null: false, foreign_key: true
      t.timestamps
    end

    add_index :user_likes, [ :user_id, :cat_fact_id ], unique: true
  end
end
