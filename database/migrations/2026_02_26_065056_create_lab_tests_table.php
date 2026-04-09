<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_tests', function (Blueprint $table) {
            $table->string('test_code', 20)->primary();
            $table->string('test_name');
            $table->string('test_name_urdu')->nullable();
            $table->string('short_name', 30);
            $table->text('alt_names')->nullable();
            $table->string('department');
            $table->string('category');
            $table->text('description')->nullable();
            $table->text('clinical_significance')->nullable();

            $table->string('sample_type');
            $table->string('sample_volume')->nullable();
            $table->string('collection_container')->nullable();
            $table->integer('num_tubes')->default(1);
            $table->string('fasting_required')->default('No');
            $table->integer('fasting_hours')->nullable();
            $table->text('special_instructions')->nullable();
            $table->jsonb('sample_stability')->nullable();
            $table->text('transport_requirements')->nullable();
            $table->jsonb('special_handling')->nullable();

            $table->boolean('has_components')->default(false);
            $table->jsonb('components')->nullable();

            $table->string('standard_tat')->nullable();
            $table->string('stat_tat')->nullable();
            $table->decimal('stat_additional_charge', 10, 2)->default(0);
            $table->text('tat_notes')->nullable();

            $table->decimal('standard_price', 10, 2)->default(0);
            $table->decimal('stat_price', 10, 2)->default(0);
            $table->jsonb('panel_rates')->nullable();
            $table->decimal('sehat_card_rate', 10, 2)->nullable();
            $table->decimal('home_collection_fee', 10, 2)->nullable();
            $table->decimal('reagent_cost', 10, 2)->nullable();
            $table->decimal('cost_per_test', 10, 2)->nullable();

            $table->text('indications')->nullable();
            $table->jsonb('common_diagnoses')->nullable();
            $table->text('interpretation_guidelines')->nullable();
            $table->text('interfering_factors')->nullable();
            $table->jsonb('related_tests')->nullable();
            $table->text('patient_preparation')->nullable();

            $table->string('methodology')->nullable();
            $table->string('equipment')->nullable();
            $table->jsonb('accreditation')->nullable();
            $table->text('internal_notes')->nullable();
            $table->string('status')->default('Active');
            $table->jsonb('available_in')->nullable();
            $table->string('reference_lab_name')->nullable();
            $table->string('reference_lab_tat')->nullable();
            $table->decimal('reference_lab_cost', 10, 2)->nullable();

            $table->integer('order_count')->default(0);
            $table->timestamps();
        });

        Schema::create('lab_test_packages', function (Blueprint $table) {
            $table->string('package_code', 20)->primary();
            $table->string('package_name');
            $table->string('package_name_urdu')->nullable();
            $table->text('description')->nullable();
            $table->jsonb('target_audience')->nullable();
            $table->jsonb('tests')->nullable();
            $table->decimal('individual_total', 10, 2)->default(0);
            $table->decimal('package_price', 10, 2)->default(0);
            $table->decimal('discount_percent', 5, 2)->default(0);
            $table->jsonb('sample_summary')->nullable();
            $table->boolean('fasting_required')->default(false);
            $table->integer('fasting_hours')->nullable();
            $table->string('max_tat')->nullable();
            $table->jsonb('departments')->nullable();
            $table->string('status')->default('Active');
            $table->jsonb('available_for')->nullable();
            $table->string('display_priority')->default('Normal');
            $table->date('valid_from')->nullable();
            $table->date('valid_to')->nullable();
            $table->text('internal_notes')->nullable();
            $table->integer('order_count')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_test_packages');
        Schema::dropIfExists('lab_tests');
    }
};
