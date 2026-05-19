<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name'             => 'Super Admin',
            'email'            => 'Superadmin@healthops.com',
            'password'         => bcrypt('Superadmin@54321'),
            'role'             => 'superadmin',
            'is_active'        => true,
            'email_verified_at' => now(),
        ]);
    }
}
