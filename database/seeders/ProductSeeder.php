<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'user_id' => 1,
                'category_id' => 1,
                'title' => 'iPhone 13 (128GB)',
                'description' => 'Well-maintained iPhone 13 with original charger.',
                'price' => 45000,
                'condition' => 'good',
                'negotiable' => true,
                'status' => 'available',
            ],
            [
                'user_id' => 1,
                'category_id' => 1,
                'title' => 'MacBook Air M2',
                'description' => 'Lightly used MacBook Air M2, perfect for students.',
                'price' => 75000,
                'condition' => 'like_new',
                'negotiable' => true,
            ],
            [
                'user_id' => 1,
                'category_id' => 1,
                'title' => 'HP Pavilion Gaming Laptop',
                'description' => 'Ryzen 5 laptop suitable for gaming and development.',
                'price' => 52000,
                'condition' => 'good',
                'negotiable' => true,
            ],
            [
                'user_id' => 1,
                'category_id' => 2,
                'title' => 'Study Table',
                'description' => 'Spacious wooden study table with storage drawers.',
                'price' => 3500,
                'condition' => 'good',
                'negotiable' => false,
            ],
            [
                'user_id' => 1,
                'category_id' => 2,
                'title' => 'Office Chair',
                'description' => 'Ergonomic office chair with adjustable height.',
                'price' => 4500,
                'condition' => 'like_new',
                'negotiable' => true,
            ],
            [
                'user_id' => 1,
                'category_id' => 3,
                'title' => 'Engineering Mechanics Textbook',
                'description' => 'First-year engineering textbook in excellent condition.',
                'price' => 400,
                'condition' => 'fair',
                'negotiable' => false,
            ],
            [
                'user_id' => 1,
                'category_id' => 3,
                'title' => 'Casio FX-991ES Plus Calculator',
                'description' => 'Scientific calculator approved for engineering exams.',
                'price' => 900,
                'condition' => 'good',
                'negotiable' => false,
            ],
            [
                'user_id' => 1,
                'category_id' => 4,
                'title' => 'Hero Ranger Bicycle',
                'description' => 'Well-maintained bicycle suitable for campus travel.',
                'price' => 5500,
                'condition' => 'good',
                'negotiable' => true,
            ],
            [
                'user_id' => 1,
                'category_id' => 1,
                'title' => 'Samsung Galaxy Buds 2',
                'description' => 'Wireless earbuds with charging case included.',
                'price' => 3500,
                'condition' => 'like_new',
                'negotiable' => true,
            ],
            [
                'user_id' => 1,
                'category_id' => 5,
                'title' => 'Philips Electric Kettle',
                'description' => '1.5L electric kettle ideal for hostel use.',
                'price' => 1200,
                'condition' => 'like_new',
                'negotiable' => false,
                'status' => 'sold',
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}