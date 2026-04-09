<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medication_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_id')->unique();
            $table->timestamp('order_time');
            $table->string('patient_name');
            $table->string('mrn');
            $table->string('visit_number')->nullable();
            $table->integer('patient_age')->nullable();
            $table->string('patient_gender')->nullable();
            $table->string('patient_location')->nullable();
            $table->string('diagnosis')->nullable();
            $table->jsonb('allergies')->nullable();
            $table->jsonb('current_medications')->nullable();
            $table->jsonb('lab_values')->nullable();
            $table->string('department');
            $table->string('ward')->nullable();
            $table->string('bed')->nullable();
            $table->string('priority')->default('Routine');
            $table->jsonb('items');
            $table->integer('items_count')->default(0);
            $table->decimal('order_value', 12, 2)->default(0);
            $table->string('ordered_by');
            $table->string('status')->default('Pending');
            $table->string('payment_status')->default('Pending');
            $table->string('payment_category')->default('Cash');
            $table->decimal('patient_payable', 12, 2)->default(0);
            $table->decimal('panel_payable', 12, 2)->default(0);
            $table->string('coverage_status')->nullable();
            $table->integer('tat_minutes')->default(30);
            $table->jsonb('clinical_checks')->nullable();
            $table->text('notes')->nullable();
            $table->string('dispensed_by')->nullable();
            $table->timestamp('dispensed_at')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->string('verified_by')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medication_orders');
    }
};
