<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ipd_form_sections', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('label');
            $table->boolean('is_default')->default(false);
            $table->boolean('is_enabled')->default(true);
            $table->string('department')->nullable();
            $table->integer('sort_order')->default(0);
            $table->json('fields')->nullable();
            $table->timestamps();
        });

        DB::table('ipd_form_sections')->insert([
            ['key' => 'medication',    'label' => 'Medication',          'is_default' => true, 'is_enabled' => true, 'department' => null, 'sort_order' => 1, 'fields' => '[]', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'investigation', 'label' => 'Investigation Orders', 'is_default' => true, 'is_enabled' => true, 'department' => null, 'sort_order' => 2, 'fields' => '[]', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'ivfluids',      'label' => 'IV Fluids',           'is_default' => true, 'is_enabled' => true, 'department' => null, 'sort_order' => 3, 'fields' => '[]', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'diet',          'label' => 'Diet Orders',         'is_default' => true, 'is_enabled' => true, 'department' => null, 'sort_order' => 4, 'fields' => '[]', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'nursing',       'label' => 'Nursing Care',        'is_default' => true, 'is_enabled' => true, 'department' => null, 'sort_order' => 5, 'fields' => '[]', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'procedure',     'label' => 'Procedures',          'is_default' => true, 'is_enabled' => true, 'department' => null, 'sort_order' => 6, 'fields' => '[]', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'ordersummary',  'label' => 'Order Summary',       'is_default' => true, 'is_enabled' => true, 'department' => null, 'sort_order' => 7, 'fields' => '[]', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('ipd_form_sections');
    }
};
