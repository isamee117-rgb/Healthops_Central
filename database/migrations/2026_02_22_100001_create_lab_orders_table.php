<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_id')->unique();
            $table->timestamp('order_time');
            $table->string('patient_name');
            $table->string('mrn')->nullable();
            $table->string('visit_number')->nullable();
            $table->integer('patient_age')->nullable();
            $table->string('patient_gender', 10)->nullable();
            $table->string('patient_location')->nullable();
            $table->string('diagnosis')->nullable();
            $table->json('allergies')->nullable();
            $table->json('relevant_history')->nullable();
            $table->string('source_department');
            $table->string('ward')->nullable();
            $table->string('bed')->nullable();
            $table->string('priority')->default('Routine');
            $table->string('status')->default('Pending');
            $table->string('sample_status')->default('Not Collected');
            $table->integer('tests_count')->default(0);
            $table->string('ordered_by');
            $table->string('clinical_indication')->nullable();
            $table->text('clinical_notes')->nullable();
            $table->json('drug_history')->nullable();
            $table->boolean('fasting_required')->default(false);
            $table->boolean('fasting_compliant')->nullable();
            $table->boolean('critical_flag')->default(false);
            $table->integer('tat_minutes')->default(1440);
            $table->timestamp('collected_at')->nullable();
            $table->string('collected_by')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->string('verified_by')->nullable();
            $table->timestamp('reported_at')->nullable();
            $table->text('cancel_reason')->nullable();
            $table->text('hold_reason')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('lab_order_tests', function (Blueprint $table) {
            $table->id();
            $table->string('test_id')->unique();
            $table->string('lab_order_id');
            $table->string('test_name');
            $table->string('test_code')->nullable();
            $table->string('category');
            $table->string('specimen_type');
            $table->string('container_type')->nullable();
            $table->string('volume')->nullable();
            $table->boolean('fasting_required')->default(false);
            $table->string('status')->default('Pending');
            $table->string('special_instructions')->nullable();
            $table->string('storage_temp')->nullable();
            $table->string('transport_medium')->nullable();
            $table->string('stability')->nullable();
            $table->json('result_data')->nullable();
            $table->string('result_status')->nullable();
            $table->timestamp('collected_at')->nullable();
            $table->timestamp('result_entered_at')->nullable();
            $table->string('result_entered_by')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->string('verified_by')->nullable();
            $table->timestamps();

            $table->foreign('lab_order_id')->references('order_id')->on('lab_orders')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_order_tests');
        Schema::dropIfExists('lab_orders');
    }
};
