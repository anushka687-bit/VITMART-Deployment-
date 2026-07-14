<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Superseded by DatabaseSeeder (which reads ADMIN_EMAIL / ADMIN_PASSWORD
 * from .env). This seeder previously created a second admin account with a
 * weak hardcoded password — removed. Safe to delete this file.
 */
class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Intentionally empty.
    }
}
