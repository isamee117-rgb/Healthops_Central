<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('staff', function (Blueprint $table) {
            $table->id();
            $table->string('staff_id')->unique();
            $table->string('employee_id')->unique();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('gender')->default('');
            $table->date('dob')->nullable();
            $table->string('cnic')->default('');
            $table->string('blood_group')->default('');
            $table->string('marital_status')->default('');
            $table->string('phone')->default('');
            $table->string('secondary_phone')->default('');
            $table->string('email')->default('');
            $table->text('current_address')->nullable();
            $table->text('permanent_address')->nullable();
            $table->string('emergency_contact_name')->default('');
            $table->string('emergency_contact_relationship')->default('');
            $table->string('emergency_contact_phone')->default('');
            $table->string('category');
            $table->string('designation');
            $table->string('department');
            $table->string('shift')->default('');
            $table->string('employment_type')->default('');
            $table->string('employment_status')->default('ACTIVE');
            $table->date('joining_date')->nullable();
            $table->date('contract_end_date')->nullable();
            $table->string('education_level')->default('');
            $table->string('qualification')->default('');
            $table->string('registration_authority')->default('');
            $table->string('registration_number')->default('');
            $table->date('registration_valid_until')->nullable();
            $table->string('certifications')->default('');
            $table->string('special_skills')->default('');
            $table->string('work_experience')->default('');
            $table->text('notes')->nullable();
            $table->text('internal_notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff');
    }
};
