class CreateCatFacts < ActiveRecord::Migration[8.1]
  def change
    create_table :cat_facts do |t|
      t.text :fact_text, null: false
      t.integer :length
      t.string :api_fact_id, limit: 50
      t.timestamps
    end

    add_index :cat_facts, :api_fact_id, unique: true
  end
end
