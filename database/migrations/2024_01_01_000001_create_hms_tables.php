<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hospital_info', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('short_name');
            $table->string('logo')->default('');
            $table->string('registration_number');
            $table->string('ntn');
            $table->string('health_authority_reg');
            $table->string('primary_phone');
            $table->string('secondary_phone')->nullable();
            $table->string('email');
            $table->string('website')->nullable();
            $table->string('address');
            $table->string('city');
            $table->string('province');
            $table->string('country');
            $table->string('postal_code');
            $table->string('invoice_header')->default('');
            $table->string('invoice_footer')->default('');
            $table->string('currency')->default('USD');
            $table->decimal('tax_percentage', 5, 2)->default(0);
            $table->string('invoice_prefix')->default('INV-');
            $table->timestamps();
        });

        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->string('mrn')->unique();
            $table->string('name');
            $table->integer('age');
            $table->string('gender');
            $table->string('phone');
            $table->string('cnic');
            $table->integer('visit_count')->default(0);
            $table->boolean('is_locked')->default(false);
            $table->string('blood_group')->nullable();
            $table->text('address')->nullable();
            $table->timestamp('first_visit_date')->nullable();
            $table->timestamp('last_visit_date')->nullable();
            $table->json('allergies')->nullable();
            $table->timestamps();
        });

        Schema::create('doctors', function (Blueprint $table) {
            $table->id();
            $table->string('doctor_id')->unique();
            $table->string('employee_id')->unique();
            $table->string('role');
            $table->string('designation');
            $table->string('department');
            $table->string('specialist');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('father_name')->nullable();
            $table->string('mother_name')->nullable();
            $table->string('gender');
            $table->string('marital_status')->nullable();
            $table->string('blood_group')->nullable();
            $table->date('dob')->nullable();
            $table->string('phone');
            $table->string('email');
            $table->string('emergency_contact')->nullable();
            $table->string('cnic');
            $table->text('current_address')->nullable();
            $table->text('permanent_address')->nullable();
            $table->string('qualification')->nullable();
            $table->string('work_experience')->nullable();
            $table->string('specialization')->nullable();
            $table->text('notes')->nullable();
            $table->decimal('basic_salary', 12, 2)->default(0);
            $table->string('contract_type')->nullable();
            $table->string('work_shift')->nullable();
            $table->string('work_location')->nullable();
            $table->string('bank_account_number')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('bank_branch_name')->nullable();
            $table->date('joining_date')->nullable();
            $table->date('relieving_date')->nullable();
            $table->string('duty_from')->nullable();
            $table->string('duty_to')->nullable();
            $table->json('duty_days')->nullable();
            $table->string('status')->default('ACTIVE');
            $table->timestamps();
        });

        Schema::create('floors', function (Blueprint $table) {
            $table->id();
            $table->string('floor_id')->unique();
            $table->string('name');
            $table->string('code')->nullable();
            $table->timestamps();
        });

        Schema::create('wards', function (Blueprint $table) {
            $table->id();
            $table->string('ward_id')->unique();
            $table->string('name');
            $table->string('category');
            $table->string('floor_id');
            $table->foreign('floor_id')->references('floor_id')->on('floors');
            $table->timestamps();
        });

        Schema::create('beds', function (Blueprint $table) {
            $table->id();
            $table->string('bed_id')->unique();
            $table->string('bed_number');
            $table->string('type');
            $table->string('ward_id');
            $table->string('floor_id');
            $table->string('status')->default('Available');
            $table->string('assigned_patient_name')->nullable();
            $table->string('assigned_patient_mrn')->nullable();
            $table->timestamp('admission_date')->nullable();
            $table->foreign('ward_id')->references('ward_id')->on('wards');
            $table->foreign('floor_id')->references('floor_id')->on('floors');
            $table->timestamps();
        });

        Schema::create('opd_visits', function (Blueprint $table) {
            $table->id();
            $table->integer('visit_id')->unique();
            $table->integer('visit_number');
            $table->string('mrn');
            $table->string('patient_name');
            $table->string('doctor_name');
            $table->string('department');
            $table->string('visit_type')->nullable();
            $table->string('referred_by')->nullable();
            $table->timestamp('consultation_date');
            $table->string('status')->default('Active');
            $table->string('payment_status')->default('Pending');
            $table->foreign('mrn')->references('mrn')->on('patients');
            $table->timestamps();
        });

        Schema::create('emergency_visits', function (Blueprint $table) {
            $table->id();
            $table->integer('visit_id')->unique();
            $table->integer('visit_number');
            $table->string('mrn');
            $table->string('patient_name');
            $table->string('doctor_name');
            $table->string('department');
            $table->string('visit_type');
            $table->timestamp('consultation_date');
            $table->string('status')->default('Active');
            $table->string('payment_status')->default('Pending');
            $table->string('esi');
            $table->string('mode_of_arrival');
            $table->string('triage_category')->nullable();
            $table->text('chief_complaint')->nullable();
            $table->json('vitals')->nullable();
            $table->string('clinical_status')->nullable();
            $table->string('disposition')->nullable();
            $table->foreign('mrn')->references('mrn')->on('patients');
            $table->timestamps();
        });

        Schema::create('ipd_admissions', function (Blueprint $table) {
            $table->id();
            $table->integer('admission_id')->unique();
            $table->integer('admission_number');
            $table->string('mrn');
            $table->string('patient_name');
            $table->string('doctor_name');
            $table->string('department');
            $table->timestamp('admission_date');
            $table->string('admission_source');
            $table->string('status')->default('Active');
            $table->string('payment_status')->default('Pending');
            $table->string('admission_type');
            $table->text('initial_diagnosis')->nullable();
            $table->string('estimated_stay')->nullable();
            $table->string('ward')->nullable();
            $table->string('floor_room')->nullable();
            $table->string('bed')->nullable();
            $table->string('bed_id')->nullable();
            $table->foreign('mrn')->references('mrn')->on('patients');
            $table->timestamps();
        });

        Schema::create('operations', function (Blueprint $table) {
            $table->id();
            $table->string('operation_id')->unique();
            $table->integer('operation_number');
            $table->string('mrn');
            $table->string('patient_name');
            $table->integer('age');
            $table->string('gender');
            $table->string('phone');
            $table->string('cnic')->nullable();
            $table->string('procedure');
            $table->string('surgery_type');
            $table->boolean('prev_related_surgery')->default(false);
            $table->text('prev_surgery_details')->nullable();
            $table->string('start_time');
            $table->date('surgery_date');
            $table->string('estimated_duration');
            $table->string('priority')->default('Medium');
            $table->string('booking_status')->default('Confirmed');
            $table->string('status')->default('Scheduled');
            $table->string('payment_status')->default('Pending');
            $table->string('admission_source');
            $table->string('surgeon');
            $table->string('anaesthetist')->nullable();
            $table->decimal('anaesthetist_fee', 12, 2)->nullable();
            $table->string('theater');
            $table->foreign('mrn')->references('mrn')->on('patients');
            $table->timestamps();
        });

        Schema::create('opd_bills', function (Blueprint $table) {
            $table->id();
            $table->string('bill_id')->unique();
            $table->string('mrn');
            $table->integer('visit_id');
            $table->string('patient_name');
            $table->decimal('consultation_charges', 12, 2)->default(0);
            $table->decimal('doctor_fee', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->string('payment_status')->default('Pending');
            $table->json('history')->nullable();
            $table->foreign('mrn')->references('mrn')->on('patients');
            $table->timestamps();
        });

        Schema::create('emergency_bills', function (Blueprint $table) {
            $table->id();
            $table->string('bill_id')->unique();
            $table->string('mrn');
            $table->integer('visit_id');
            $table->string('patient_name');
            $table->decimal('consultation_charges', 12, 2)->default(0);
            $table->decimal('doctor_fee', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->string('payment_status')->default('Pending');
            $table->json('history')->nullable();
            $table->foreign('mrn')->references('mrn')->on('patients');
            $table->timestamps();
        });

        Schema::create('ipd_bills', function (Blueprint $table) {
            $table->id();
            $table->string('bill_id')->unique();
            $table->string('mrn');
            $table->integer('admission_id');
            $table->string('patient_name');
            $table->decimal('room_charges', 12, 2)->default(0);
            $table->decimal('doctor_fee', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->string('payment_status')->default('Pending');
            $table->json('history')->nullable();
            $table->foreign('mrn')->references('mrn')->on('patients');
            $table->timestamps();
        });

        Schema::create('ot_bills', function (Blueprint $table) {
            $table->id();
            $table->string('bill_id')->unique();
            $table->string('mrn');
            $table->string('operation_id');
            $table->string('patient_name');
            $table->decimal('theater_charges', 12, 2)->default(0);
            $table->decimal('surgeon_fee', 12, 2)->default(0);
            $table->decimal('anaesthetist_fee', 12, 2)->nullable();
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->string('payment_status')->default('Pending');
            $table->json('history')->nullable();
            $table->foreign('mrn')->references('mrn')->on('patients');
            $table->timestamps();
        });

        Schema::create('doctor_fees', function (Blueprint $table) {
            $table->id();
            $table->string('fee_id')->unique();
            $table->string('doctor_id');
            $table->string('doctor_name');
            $table->string('service_type');
            $table->string('procedure')->nullable();
            $table->decimal('fee', 12, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('hospital_charges', function (Blueprint $table) {
            $table->id();
            $table->string('charge_id')->unique();
            $table->string('name');
            $table->string('module');
            $table->string('category');
            $table->decimal('amount', 12, 2)->default(0);
            $table->boolean('is_mandatory')->default(false);
            $table->timestamps();
        });

        Schema::create('opd_vitals', function (Blueprint $table) {
            $table->id();
            $table->string('vital_id')->unique();
            $table->string('mrn');
            $table->string('visit_id', 30);
            $table->decimal('temperature', 5, 2)->nullable();
            $table->integer('systolic')->nullable();
            $table->integer('diastolic')->nullable();
            $table->integer('heart_rate')->nullable();
            $table->integer('sp_o2')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('recorded_at');
            $table->string('recorded_by');
            $table->foreign('mrn')->references('mrn')->on('patients');
            $table->timestamps();
        });

        Schema::create('opd_consultations', function (Blueprint $table) {
            $table->id();
            $table->string('consultation_id')->unique();
            $table->string('visit_id', 30);
            $table->string('mrn');
            $table->string('doctor_name');
            $table->timestamp('consultation_date');
            $table->json('symptoms')->nullable();
            $table->text('clinical_findings')->nullable();
            $table->text('provisional_diagnosis')->nullable();
            $table->text('final_diagnosis')->nullable();
            $table->json('prescriptions')->nullable();
            $table->json('investigation_orders')->nullable();
            $table->text('doctor_notes')->nullable();
            $table->string('outcome')->nullable()->default('In Progress');
            $table->text('outcome_notes')->nullable();
            $table->foreign('mrn')->references('mrn')->on('patients');
            $table->timestamps();
        });

        Schema::create('nursing_records', function (Blueprint $table) {
            $table->id();
            $table->string('record_id')->unique();
            $table->string('mrn');
            $table->integer('admission_id');
            $table->string('patient_name');
            $table->string('status')->default('Pending Initial Vitals');
            $table->boolean('initial_vitals_completed')->default(false);
            $table->boolean('discharge_vitals_completed')->default(false);
            $table->foreign('mrn')->references('mrn')->on('patients');
            $table->timestamps();
        });

        Schema::create('vital_entries', function (Blueprint $table) {
            $table->id();
            $table->string('entry_id')->unique();
            $table->string('vital_master_id');
            $table->string('category');
            $table->integer('bp_systolic');
            $table->integer('bp_diastolic');
            $table->integer('pulse');
            $table->decimal('temperature', 5, 2);
            $table->integer('respiration');
            $table->integer('sp_o2');
            $table->decimal('weight', 6, 2)->nullable();
            $table->decimal('height', 6, 2)->nullable();
            $table->string('recorded_by');
            $table->timestamp('recorded_at');
            $table->foreign('vital_master_id')->references('record_id')->on('nursing_records');
            $table->timestamps();
        });

        Schema::create('clinical_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_id')->unique();
            $table->string('mrn');
            $table->integer('admission_id');
            $table->string('type');
            $table->string('priority');
            $table->text('details');
            $table->string('status')->default('Active');
            $table->string('ordered_by');
            $table->timestamp('ordered_at');
            $table->json('metadata')->nullable();
            $table->foreign('mrn')->references('mrn')->on('patients');
            $table->timestamps();
        });

        Schema::create('progress_notes', function (Blueprint $table) {
            $table->id();
            $table->string('note_id')->unique();
            $table->string('mrn');
            $table->integer('admission_id');
            $table->text('subjective');
            $table->text('objective');
            $table->text('assessment');
            $table->text('plan');
            $table->string('recorded_by');
            $table->timestamp('recorded_at');
            $table->foreign('mrn')->references('mrn')->on('patients');
            $table->timestamps();
        });

        Schema::create('finance_postings', function (Blueprint $table) {
            $table->id();
            $table->string('posting_id')->unique();
            $table->string('mrn');
            $table->string('patient_name');
            $table->string('department');
            $table->string('visit_id');
            $table->json('items')->nullable();
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->timestamp('posted_at');
            $table->string('posted_by');
            $table->timestamps();
        });

        Schema::create('finance_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_id')->unique();
            $table->string('type');
            $table->string('head');
            $table->decimal('amount', 12, 2)->default(0);
            $table->date('date');
            $table->text('remarks')->nullable();
            $table->timestamp('posted_at');
            $table->string('posted_by');
            $table->string('status')->default('POSTED');
            $table->timestamps();
        });

        Schema::create('finance_ledger', function (Blueprint $table) {
            $table->id();
            $table->string('ledger_id')->unique();
            $table->date('date');
            $table->string('source');
            $table->string('mrn')->nullable();
            $table->string('visit_id')->nullable();
            $table->string('category');
            $table->decimal('debit', 12, 2)->default(0);
            $table->decimal('credit', 12, 2)->default(0);
            $table->string('reference_id');
            $table->timestamp('posted_at');
            $table->timestamps();
        });

        Schema::create('patient_activities', function (Blueprint $table) {
            $table->id();
            $table->string('activity_id')->unique();
            $table->string('mrn');
            $table->timestamp('timestamp');
            $table->string('action');
            $table->string('user');
            $table->string('module');
            $table->text('details')->nullable();
            $table->foreign('mrn')->references('mrn')->on('patients');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_activities');
        Schema::dropIfExists('finance_ledger');
        Schema::dropIfExists('finance_transactions');
        Schema::dropIfExists('finance_postings');
        Schema::dropIfExists('progress_notes');
        Schema::dropIfExists('clinical_orders');
        Schema::dropIfExists('vital_entries');
        Schema::dropIfExists('nursing_records');
        Schema::dropIfExists('opd_consultations');
        Schema::dropIfExists('opd_vitals');
        Schema::dropIfExists('hospital_charges');
        Schema::dropIfExists('doctor_fees');
        Schema::dropIfExists('ot_bills');
        Schema::dropIfExists('ipd_bills');
        Schema::dropIfExists('emergency_bills');
        Schema::dropIfExists('opd_bills');
        Schema::dropIfExists('operations');
        Schema::dropIfExists('ipd_admissions');
        Schema::dropIfExists('emergency_visits');
        Schema::dropIfExists('opd_visits');
        Schema::dropIfExists('beds');
        Schema::dropIfExists('wards');
        Schema::dropIfExists('floors');
        Schema::dropIfExists('doctors');
        Schema::dropIfExists('patients');
        Schema::dropIfExists('hospital_info');
    }
};
