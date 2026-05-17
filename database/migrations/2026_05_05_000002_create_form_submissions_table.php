<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('form_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_id')->constrained('forms')->cascadeOnDelete();
            $table->unsignedBigInteger('form_section_id')->nullable()->index(); // null = full-form save
            $table->string('admission_id', 50)->index();
            $table->string('mrn', 50)->index();
            $table->string('context', 20)->default('ipd');
            $table->json('data');
            $table->string('submitted_by')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('form_submissions');
    }
};
