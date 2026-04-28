<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('forms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_group_id')->constrained('form_groups')->cascadeOnDelete();
            $table->string('name', 150);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('forms');
    }
};
