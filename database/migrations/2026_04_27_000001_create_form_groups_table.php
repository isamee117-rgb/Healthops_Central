<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('form_groups', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->enum('context', ['ipd', 'opd', 'emergency', 'ot', 'general']);
            $table->text('description')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('form_groups');
    }
};
