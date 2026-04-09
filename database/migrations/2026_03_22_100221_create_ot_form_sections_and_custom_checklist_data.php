<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ot_form_sections', function (Blueprint $table) {
            $table->id();
            $table->string('key', 100)->unique();
            $table->string('label', 100);
            $table->boolean('is_default')->default(false);
            $table->boolean('is_enabled')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->string('department', 100)->nullable();
            $table->json('fields')->nullable();
            $table->timestamps();
        });

        Schema::table('operations', function (Blueprint $table) {
            $table->json('custom_checklist_data')->nullable();
        });

        $builtins = [
            ['key' => 'patient_verification', 'label' => 'Patient Verification',     'sort_order' => 1],
            ['key' => 'consent',              'label' => 'Consent Documentation',     'sort_order' => 2],
            ['key' => 'preanesthetic',        'label' => 'Pre-Anesthetic Evaluation', 'sort_order' => 3],
            ['key' => 'npo',                  'label' => 'NPO Status',                'sort_order' => 4],
            ['key' => 'investigations',       'label' => 'Pre-Op Investigations',     'sort_order' => 5],
            ['key' => 'medications',          'label' => 'Pre-Op Medications',        'sort_order' => 6],
            ['key' => 'physical_prep',        'label' => 'Physical Preparation',      'sort_order' => 7],
            ['key' => 'vitals',               'label' => 'Vital Signs',               'sort_order' => 8],
            ['key' => 'allergies',            'label' => 'Allergies & Risk Factors',  'sort_order' => 9],
            ['key' => 'equipment',            'label' => 'Equipment & Supplies',      'sort_order' => 10],
            ['key' => 'final_verification',   'label' => 'Final Verification',        'sort_order' => 11],
        ];

        $now = now();
        foreach ($builtins as $s) {
            DB::table('ot_form_sections')->insert([
                'key'        => $s['key'],
                'label'      => $s['label'],
                'is_default' => true,
                'is_enabled' => true,
                'sort_order' => $s['sort_order'],
                'department' => null,
                'fields'     => json_encode([]),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('operations', function (Blueprint $table) {
            $table->dropColumn('custom_checklist_data');
        });
        Schema::dropIfExists('ot_form_sections');
    }
};
