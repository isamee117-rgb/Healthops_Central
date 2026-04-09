<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bill_corrections', function (Blueprint $table) {
            $table->id();
            $table->string('correction_id')->unique();
            $table->string('bill_id');
            $table->string('visit_id');
            $table->string('mrn');
            $table->string('section');
            $table->string('field_name');
            $table->text('old_value');
            $table->text('new_value');
            $table->string('corrected_by')->default('Admin');
            $table->text('reason')->nullable();
            $table->timestamps();

            $table->index('bill_id');
            $table->index('visit_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bill_corrections');
    }
};
