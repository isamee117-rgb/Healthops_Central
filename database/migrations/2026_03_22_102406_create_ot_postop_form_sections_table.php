<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ot_postop_form_sections', function (Blueprint $table) {
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
            ['key' => 'current_location',   'label' => 'Current Location',                              'sort_order' => 1],
            ['key' => 'pacu_assessment',    'label' => 'Immediate Post-Op Assessment (PACU / Recovery)', 'sort_order' => 2],
            ['key' => 'recovery_vitals',    'label' => 'Recovery Vitals (Every 15 Minutes)',             'sort_order' => 3],
            ['key' => 'pain_nausea',        'label' => 'Pain Assessment & Nausea/Vomiting',             'sort_order' => 4],
            ['key' => 'pod_progress',       'label' => 'Post-Op Day Progress Notes',                    'sort_order' => 5],
            ['key' => 'complications',      'label' => 'Post-Op Complications',                         'sort_order' => 6],
            ['key' => 'discharge_planning', 'label' => 'Discharge Planning',                            'sort_order' => 7],
        ];

        foreach ($builtins as $s) {
            DB::table('ot_postop_form_sections')->insert([
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
        Schema::dropIfExists('ot_postop_form_sections');
    }
};
