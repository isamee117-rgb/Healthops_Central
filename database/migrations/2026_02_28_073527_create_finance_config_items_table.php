<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('finance_config_items', function (Blueprint $table) {
            $table->id();
            $table->string('category');
            $table->string('name');
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['category', 'sort_order']);
        });

        $defaults = [
            ['category' => 'charge_category', 'name' => 'Diagnostics',   'sort_order' => 0],
            ['category' => 'charge_category', 'name' => 'Consultation',   'sort_order' => 1],
            ['category' => 'charge_category', 'name' => 'Procedure',      'sort_order' => 2],
            ['category' => 'charge_category', 'name' => 'Facility',       'sort_order' => 3],
            ['category' => 'charge_category', 'name' => 'Equipment',      'sort_order' => 4],
            ['category' => 'charge_category', 'name' => 'Medication',     'sort_order' => 5],
            ['category' => 'charge_category', 'name' => 'Other',          'sort_order' => 6],
        ];

        foreach ($defaults as $item) {
            DB::table('finance_config_items')->insert(array_merge($item, [
                'is_active'  => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('finance_config_items');
    }
};
