<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ot_form_sections', function (Blueprint $table) {
            $table->id();
            $table->string('key', 100)->unique();
            $table->string('label', 100);
            $table->boolean('is_default')->default(false);
            $table->boolean('is_enabled')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->string('department', 100)->nullable();
            $table->json('fields')->nullable();
            $table->timestamps();
        });

        Schema::table('operations', function (Blueprint $table) {
            $table->json('custom_checklist_data')->nullable();
        });

    }

    public function down(): void
    {
        Schema::table('operations', function (Blueprint $table) {
            $table->dropColumn('custom_checklist_data');
        });
        Schema::dropIfExists('ot_form_sections');
    }
};
