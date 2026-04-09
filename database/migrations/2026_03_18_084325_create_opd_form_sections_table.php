<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('opd_form_sections', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('label');
            $table->boolean('is_default')->default(false);
            $table->boolean('is_enabled')->default(true);
            $table->string('department')->nullable();
            $table->integer('sort_order')->default(0);
            $table->text('fields')->nullable();
            $table->timestamps();
        });

        DB::table('opd_form_sections')->insert([
            ['key' => 'symptoms',      'label' => 'Symptoms',             'is_default' => 1, 'is_enabled' => 1, 'department' => null, 'sort_order' => 1, 'fields' => null, 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'investigation', 'label' => 'Investigation Orders',  'is_default' => 1, 'is_enabled' => 1, 'department' => null, 'sort_order' => 2, 'fields' => null, 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'prescription',  'label' => 'Prescription',          'is_default' => 1, 'is_enabled' => 1, 'department' => null, 'sort_order' => 3, 'fields' => null, 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'notes',         'label' => 'Clinical Notes',        'is_default' => 1, 'is_enabled' => 1, 'department' => null, 'sort_order' => 4, 'fields' => null, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('opd_form_sections');
    }
};
