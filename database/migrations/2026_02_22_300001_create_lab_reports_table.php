<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_reports', function (Blueprint $table) {
            $table->id();
            $table->string('report_id', 30)->unique();
            $table->string('lab_order_id', 30);
            $table->string('patient_name');
            $table->string('mrn', 30);
            $table->string('patient_age', 50)->nullable();
            $table->string('patient_gender', 20)->nullable();
            $table->string('referred_by')->nullable();
            $table->string('source_department', 50)->nullable();
            $table->string('ward', 50)->nullable();
            $table->string('bed', 30)->nullable();
            $table->string('visit_number', 50)->nullable();
            $table->string('diagnosis')->nullable();
            $table->timestamp('collection_date')->nullable();
            $table->timestamp('report_date')->nullable();
            $table->string('report_type', 30)->default('Individual');
            $table->string('status', 30)->default('Generated');
            $table->json('test_results')->nullable();
            $table->text('pathologist_comments')->nullable();
            $table->string('performed_by')->nullable();
            $table->string('verified_by')->nullable();
            $table->string('verifier_title')->nullable();
            $table->string('verifier_qualifications')->nullable();
            $table->string('priority', 20)->default('Routine');
            $table->boolean('critical_flag')->default(false);
            $table->json('delivery_status')->nullable();
            $table->timestamp('email_sent_at')->nullable();
            $table->timestamp('sms_sent_at')->nullable();
            $table->timestamp('whatsapp_sent_at')->nullable();
            $table->timestamp('collected_at')->nullable();
            $table->timestamp('printed_at')->nullable();
            $table->string('qr_code', 100)->nullable();
            $table->integer('retention_years')->default(5);
            $table->boolean('is_archived')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_reports');
    }
};
