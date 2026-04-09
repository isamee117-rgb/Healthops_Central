<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class PromoteSuperAdmin extends Command
{
    protected $signature = 'user:superadmin {email? : The email of the user to promote}
                                            {--create : Create a new superadmin if email not found}
                                            {--list : List all users and their roles}';

    protected $description = 'Promote an existing user to superadmin, or create a new superadmin account';

    public function handle(): int
    {
        // --list flag: show all users
        if ($this->option('list')) {
            $users = User::select('id', 'name', 'email', 'role', 'is_active')->get();
            if ($users->isEmpty()) {
                $this->warn('No users found in the database.');
                return 0;
            }
            $this->table(['ID', 'Name', 'Email', 'Role', 'Active'], $users->map(fn($u) => [
                $u->id, $u->name, $u->email, $u->role, $u->is_active ? 'Yes' : 'No',
            ]));
            return 0;
        }

        $email = $this->argument('email');

        // No email given — prompt
        if (!$email) {
            $email = $this->ask('Enter the email address of the user to promote (or type "new" to create one)');
        }

        // Create a brand-new superadmin
        if (strtolower($email) === 'new' || $this->option('create')) {
            return $this->createSuperAdmin();
        }

        // Find and promote existing user
        $user = User::where('email', $email)->first();
        if (!$user) {
            $this->error("No user found with email: {$email}");
            $this->line('Tip: run <comment>php artisan user:superadmin --list</comment> to see all users.');
            return 1;
        }

        $oldRole = $user->role;
        $user->role      = 'superadmin';
        $user->is_active = true;
        $user->save();

        $this->info("✅ {$user->name} ({$user->email}) promoted to superadmin.");
        $this->line("   Previous role: <comment>{$oldRole}</comment> → <info>superadmin</info>");
        $this->line('   Please log out and log back in for the change to take effect.');

        return 0;
    }

    private function createSuperAdmin(): int
    {
        $this->info('Creating a new superadmin account...');

        $name     = $this->ask('Full name');
        $email    = $this->ask('Email address');
        $password = $this->secret('Password (min 8 characters)');

        if (strlen($password) < 8) {
            $this->error('Password must be at least 8 characters.');
            return 1;
        }

        if (User::where('email', $email)->exists()) {
            $this->error("A user with email {$email} already exists. Use the promote option instead.");
            return 1;
        }

        $user = User::create([
            'name'      => $name,
            'email'     => $email,
            'password'  => $password,   // auto-hashed by model cast
            'role'      => 'superadmin',
            'is_active' => true,
        ]);

        $this->info("✅ Superadmin account created successfully!");
        $this->table(['ID', 'Name', 'Email', 'Role'], [[
            $user->id, $user->name, $user->email, $user->role,
        ]]);

        return 0;
    }
}
