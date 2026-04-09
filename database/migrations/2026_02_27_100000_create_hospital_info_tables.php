<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hospital_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('group');
            $table->timestamps();
        });

        Schema::create('hospital_departments', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('name_urdu')->nullable();
            $table->string('code')->nullable();
            $table->string('hod_name')->nullable();
            $table->string('location')->nullable();
            $table->string('extension')->nullable();
            $table->string('direct_line')->nullable();
            $table->string('email')->nullable();
            $table->text('services')->nullable();
            $table->string('opd_start')->nullable();
            $table->string('opd_end')->nullable();
            $table->boolean('is_emergency_24x7')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->timestamps();
        });

        Schema::create('hospital_signatories', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('name');
            $table->string('qualifications')->nullable();
            $table->string('designation');
            $table->string('registration_number')->nullable();
            $table->string('photo_path')->nullable();
            $table->string('signature_path')->nullable();
            $table->string('stamp_path')->nullable();
            $table->json('use_on')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->timestamps();
        });

        Schema::create('hospital_bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('label');
            $table->string('bank_name');
            $table->string('branch')->nullable();
            $table->string('branch_code')->nullable();
            $table->string('account_title');
            $table->string('account_number');
            $table->string('iban')->nullable();
            $table->string('account_type')->default('current');
            $table->string('swift_code')->nullable();
            $table->json('use_for')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->timestamps();
        });

        Schema::create('insurance_panels', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('panel_code')->nullable();
            $table->string('company_type')->nullable();
            $table->string('contact_person')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->json('coverage')->nullable();
            $table->json('discount_rates')->nullable();
            $table->decimal('credit_limit')->nullable();
            $table->string('payment_terms')->nullable();
            $table->date('agreement_start')->nullable();
            $table->date('agreement_end')->nullable();
            $table->boolean('auto_renewable')->default(false);
            $table->string('document_path')->nullable();
            $table->string('status')->default('active');
            $table->integer('display_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('insurance_panels');
        Schema::dropIfExists('hospital_bank_accounts');
        Schema::dropIfExists('hospital_signatories');
        Schema::dropIfExists('hospital_departments');
        Schema::dropIfExists('hospital_settings');
    }
};
