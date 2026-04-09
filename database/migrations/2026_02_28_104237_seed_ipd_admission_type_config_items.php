<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $defaults = ['Routine', 'Emergency', 'Elective', 'Day Case', 'Observation'];
        foreach ($defaults as $i => $name) {
            $exists = DB::table('opd_config_items')
                ->where('category', 'ipd_admission_type')
                ->where('name', $name)
                ->exists();
            if (!$exists) {
                DB::table('opd_config_items')->insert([
                    'category'   => 'ipd_admission_type',
                    'name'       => $name,
                    'is_active'  => 1,
                    'sort_order' => $i,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        DB::table('opd_config_items')
            ->where('category', 'ipd_admission_type')
            ->delete();
    }
};
