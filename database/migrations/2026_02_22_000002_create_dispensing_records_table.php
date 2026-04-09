<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dispensing_records', function (Blueprint $table) {
            $table->id();
            $table->string('dispensing_id')->unique();
            $table->string('order_id');
            $table->string('patient_name');
            $table->string('mrn');
            $table->string('visit_number')->nullable();
            $table->string('department');
            $table->string('ward')->nullable();
            $table->string('bed')->nullable();
            $table->string('priority')->default('Routine');
            $table->jsonb('items_dispensing');
            $table->jsonb('counseling_checklist')->nullable();
            $table->text('counseling_notes')->nullable();
            $table->string('counseled_by')->nullable();
            $table->boolean('patient_signature')->default(false);
            $table->string('dispensed_by')->nullable();
            $table->timestamp('dispensed_at')->nullable();
            $table->string('status')->default('In Progress');
            $table->decimal('total_value', 12, 2)->default(0);
            $table->integer('total_items')->default(0);
            $table->integer('items_dispensed')->default(0);
            $table->boolean('all_labels_printed')->default(false);
            $table->boolean('counseling_done')->default(false);
            $table->boolean('stock_updated')->default(false);
            $table->timestamps();

            $table->foreign('order_id')->references('order_id')->on('medication_orders');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dispensing_records');
    }
};
