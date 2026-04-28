<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('form_components', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_section_id')->constrained('form_sections')->cascadeOnDelete();
            $table->string('type', 50);
            $table->string('label', 200);
            $table->string('key', 100)->nullable();
            $table->boolean('is_required')->default(false);
            $table->integer('sort_order')->default(0);
            $table->json('config')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('form_components');
    }
};
