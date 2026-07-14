<?php

namespace Database\Seeders;

use App\Models\{Category, User, Setting};
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Default categories (required by the app)
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

        // Admin account — credentials come from .env (ADMIN_EMAIL / ADMIN_PASSWORD)
        // so nothing sensitive is hardcoded in the repo. More admins can be
        // added later from the admin panel (Settings → Add New Admin).
        $adminEmail    = env('ADMIN_EMAIL');
        $adminPassword = env('ADMIN_PASSWORD');
        if ($adminEmail && $adminPassword) {
            // updateOrCreate (not firstOrCreate): if this email already exists —
            // e.g. it was registered as a normal user account — it gets promoted
            // to admin and its password reset to ADMIN_PASSWORD on every seed.
            $admin = User::firstOrNew(['email' => $adminEmail]);
            $admin->name              = $admin->name ?: 'Admin';
            $admin->password          = Hash::make($adminPassword);
            $admin->role              = 'admin';
            $admin->email_verified_at = $admin->email_verified_at ?: now();
            $admin->is_blocked        = false;
            $admin->save();

            // Remove the old placeholder admin accounts from earlier seeders.
            User::where('role', 'admin')
                ->whereIn('email', ['admin@vit.ac.in', 'admin@vitmart.com'])
                ->where('email', '!=', $adminEmail)
                ->delete();
        } else {
            $this->command?->warn('ADMIN_EMAIL / ADMIN_PASSWORD not set in .env — skipped creating the admin account.');
        }

        // Default settings
        Setting::set('marketplace_name', 'VITMart');
        Setting::set('admin_email', $adminEmail ?: 'admin@vit.ac.in');
        Setting::set('logo_path', '');
    }
}
