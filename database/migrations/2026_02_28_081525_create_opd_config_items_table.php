<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('opd_config_items', function (Blueprint $table) {
            $table->id();
            $table->string('category');
            $table->string('name');
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['category', 'sort_order']);
        });

        $defaults = [
            ['name' => 'New Patient Visit',       'sort_order' => 0],
            ['name' => 'Follow-up Visit',         'sort_order' => 1],
            ['name' => 'Consultation',            'sort_order' => 2],
            ['name' => 'Referral Visit',          'sort_order' => 3],
            ['name' => 'Routine Checkup',         'sort_order' => 4],
            ['name' => 'Pre-Operative Visit',     'sort_order' => 5],
            ['name' => 'Post-Operative Visit',    'sort_order' => 6],
            ['name' => 'Specialist Consultation', 'sort_order' => 7],
            ['name' => 'Telemedicine Visit',      'sort_order' => 8],
        ];

        foreach ($defaults as $item) {
            DB::table('opd_config_items')->insert([
                'category'   => 'opd_visit_type',
                'name'       => $item['name'],
                'is_active'  => true,
                'sort_order' => $item['sort_order'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('opd_config_items');
    }
};
