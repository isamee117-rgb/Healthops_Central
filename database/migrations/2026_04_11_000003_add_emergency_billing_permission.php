<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $slug = 'emergency.billing.access';

        if (!DB::table('permissions')->where('slug', $slug)->exists()) {
            $maxOrder = DB::table('permissions')->max('display_order') ?? 0;

            DB::table('permissions')->insert([
                'name'          => 'ER Billing & Payment Access',
                'slug'          => $slug,
                'description'   => 'Access to ER Billing & Payment tab',
                'module'        => 'emergency.billing',
                'parent_module' => 'emergency',
                'level'         => 'tab',
                'action_type'   => null,
                'is_dangerous'  => false,
                'display_order' => $maxOrder + 1,
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);
        }
    }

    public function down(): void
    {
        DB::table('permissions')->where('slug', 'emergency.billing.access')->delete();
    }
};
