<?php

namespace Database\Seeders;

use App\Models\{Category, User, Setting};
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Default categories
        $categories = [
            'Books', 'Cycles', 'Electronics', 'Lab Equipment',
            'Hostel Essentials', 'Furniture', 'Sports', 'Others',
        ];
        foreach ($categories as $name) {
            Category::firstOrCreate(
                ['name' => $name],
                ['slug' => \Illuminate\Support\Str::slug($name)]
            );
        }

        // Admin account
        User::firstOrCreate(
            ['email' => 'admin@vit.ac.in'],
            [
                'name'              => 'Admin',
                'password'          => Hash::make('Admin@1234'),
                'role'              => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // Default settings
        Setting::set('marketplace_name', 'VITMart');
        Setting::set('admin_email', 'admin@vit.ac.in');
        Setting::set('logo_path', '');

        echo "✅ Seeded categories, admin user, and settings.\n";
        echo "   Admin: admin@vit.ac.in / Admin@1234\n";
    }
}
