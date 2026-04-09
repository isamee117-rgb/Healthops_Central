<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->string('contact_type', 20)->default('SELF')->after('allergies');
            $table->string('guardian_name', 100)->nullable()->after('contact_type');
            $table->string('guardian_phone', 20)->nullable()->after('guardian_name');
            $table->string('guardian_cnic', 20)->nullable()->after('guardian_phone');
            $table->string('relationship_to_patient', 50)->nullable()->after('guardian_cnic');
            $table->string('status', 20)->default('ACTIVE')->after('relationship_to_patient');
            $table->index('phone');
            $table->index('contact_type');
        });

        if (DB::getDriverName() !== 'sqlite') {
            DB::statement('ALTER TABLE opd_visits ALTER COLUMN visit_id TYPE VARCHAR(30) USING visit_id::VARCHAR(30)');
            DB::statement('ALTER TABLE opd_bills ALTER COLUMN visit_id TYPE VARCHAR(30) USING visit_id::VARCHAR(30)');
            DB::statement('ALTER TABLE opd_vitals ALTER COLUMN visit_id TYPE VARCHAR(30) USING visit_id::VARCHAR(30)');
            DB::statement('ALTER TABLE opd_consultations ALTER COLUMN visit_id TYPE VARCHAR(30) USING visit_id::VARCHAR(30)');
            DB::statement('ALTER TABLE emergency_visits ALTER COLUMN visit_id TYPE VARCHAR(30) USING visit_id::VARCHAR(30)');
            DB::statement('ALTER TABLE emergency_bills ALTER COLUMN visit_id TYPE VARCHAR(30) USING visit_id::VARCHAR(30)');
            DB::statement('ALTER TABLE ipd_admissions ALTER COLUMN admission_id TYPE VARCHAR(30) USING admission_id::VARCHAR(30)');
            DB::statement('ALTER TABLE ipd_bills ALTER COLUMN admission_id TYPE VARCHAR(30) USING admission_id::VARCHAR(30)');
            DB::statement('ALTER TABLE nursing_records ALTER COLUMN admission_id TYPE VARCHAR(30) USING admission_id::VARCHAR(30)');
            DB::statement('ALTER TABLE clinical_orders ALTER COLUMN admission_id TYPE VARCHAR(30) USING admission_id::VARCHAR(30)');
            DB::statement('ALTER TABLE progress_notes ALTER COLUMN admission_id TYPE VARCHAR(30) USING admission_id::VARCHAR(30)');
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement('ALTER TABLE progress_notes ALTER COLUMN admission_id TYPE INTEGER USING admission_id::INTEGER');
            DB::statement('ALTER TABLE clinical_orders ALTER COLUMN admission_id TYPE INTEGER USING admission_id::INTEGER');
            DB::statement('ALTER TABLE nursing_records ALTER COLUMN admission_id TYPE INTEGER USING admission_id::INTEGER');
            DB::statement('ALTER TABLE ipd_bills ALTER COLUMN admission_id TYPE INTEGER USING admission_id::INTEGER');
            DB::statement('ALTER TABLE ipd_admissions ALTER COLUMN admission_id TYPE INTEGER USING admission_id::INTEGER');
            DB::statement('ALTER TABLE emergency_bills ALTER COLUMN visit_id TYPE INTEGER USING visit_id::INTEGER');
            DB::statement('ALTER TABLE emergency_visits ALTER COLUMN visit_id TYPE INTEGER USING visit_id::INTEGER');
            DB::statement('ALTER TABLE opd_consultations ALTER COLUMN visit_id TYPE INTEGER USING visit_id::INTEGER');
            DB::statement('ALTER TABLE opd_vitals ALTER COLUMN visit_id TYPE INTEGER USING visit_id::INTEGER');
            DB::statement('ALTER TABLE opd_bills ALTER COLUMN visit_id TYPE INTEGER USING visit_id::INTEGER');
            DB::statement('ALTER TABLE opd_visits ALTER COLUMN visit_id TYPE INTEGER USING visit_id::INTEGER');
        }

        Schema::table('patients', function (Blueprint $table) {
            $table->dropIndex(['contact_type']);
            $table->dropIndex(['phone']);
            $table->dropColumn([
                'status',
                'relationship_to_patient',
                'guardian_cnic',
                'guardian_phone',
                'guardian_name',
                'contact_type',
            ]);
        });
    }
};
