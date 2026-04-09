<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ot_intraop_form_sections', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('label');
            $table->boolean('is_default')->default(false);
            $table->boolean('is_enabled')->default(true);
            $table->string('department')->nullable();
            $table->integer('sort_order')->default(0);
            $table->json('fields')->nullable();
            $table->timestamps();
        });

        $builtins = [
            ['key' => 'who_signin',            'label' => 'WHO Safety Checklist — Sign In',           'sort_order' => 1],
            ['key' => 'who_timeout',           'label' => 'WHO Safety Checklist — Time Out',          'sort_order' => 2],
            ['key' => 'anesthesia_induction',  'label' => 'Anesthesia — Induction',                  'sort_order' => 3],
            ['key' => 'anesthesia_maintenance','label' => 'Anesthesia — Maintenance',                'sort_order' => 4],
            ['key' => 'vitals_monitoring',     'label' => 'Monitoring — Vitals Log',                 'sort_order' => 5],
            ['key' => 'fluids_blood',          'label' => 'Fluids & Blood Products',                 'sort_order' => 6],
            ['key' => 'surgery_timeline',      'label' => 'Surgery Timeline',                        'sort_order' => 7],
            ['key' => 'position_findings',     'label' => 'Position & Surgical Findings',            'sort_order' => 8],
            ['key' => 'procedure_specimens',   'label' => 'Procedure & Specimens',                   'sort_order' => 9],
            ['key' => 'drains_catheters',      'label' => 'Drains & Catheters',                     'sort_order' => 10],
            ['key' => 'surgical_counts',       'label' => 'Surgical Counts (Critical Safety)',       'sort_order' => 11],
            ['key' => 'complications',         'label' => 'Complications',                           'sort_order' => 12],
            ['key' => 'surgical_team',         'label' => 'Surgical Team',                          'sort_order' => 13],
            ['key' => 'postop_instructions',   'label' => 'Post-Operative Instructions',             'sort_order' => 14],
            ['key' => 'who_signout',           'label' => 'WHO Safety Checklist — Sign Out',         'sort_order' => 15],
        ];

        foreach ($builtins as $s) {
            DB::table('ot_intraop_form_sections')->insert([
                'key'        => $s['key'],
                'label'      => $s['label'],
                'is_default' => 1,
                'is_enabled' => 1,
                'sort_order' => $s['sort_order'],
                'fields'     => json_encode([]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('ot_intraop_form_sections');
    }
};
