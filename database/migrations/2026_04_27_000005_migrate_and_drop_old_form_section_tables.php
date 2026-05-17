<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        $now = now();

        // ── OPD: migrate only if source table has rows ───────────────────────
        if (Schema::hasTable('opd_form_sections') && DB::table('opd_form_sections')->exists()) {
            $opdGroupId = DB::table('form_groups')->insertGetId([
                'name' => 'Outpatient Department', 'context' => 'opd',
                'sort_order' => 1, 'is_active' => 1,
                'created_at' => $now, 'updated_at' => $now,
            ]);
            foreach (DB::table('opd_form_sections')->orderBy('sort_order')->orderBy('id')->get() as $i => $old) {
                $formId = DB::table('forms')->insertGetId([
                    'form_group_id' => $opdGroupId,
                    'name'          => $old->label,
                    'sort_order'    => $i + 1,
                    'is_active'     => 1,
                    'created_at'    => $now, 'updated_at' => $now,
                ]);
                DB::table('form_sections')->insert([
                    'form_id' => $formId, 'title' => $old->label,
                    'sort_order' => 1, 'created_at' => $now, 'updated_at' => $now,
                ]);
            }
        }

        // ── IPD ──────────────────────────────────────────────────────────────
        if (Schema::hasTable('ipd_form_sections') && DB::table('ipd_form_sections')->exists()) {
            $ipdGroupId = DB::table('form_groups')->insertGetId([
                'name' => 'Inpatient Department', 'context' => 'ipd',
                'sort_order' => 2, 'is_active' => 1,
                'created_at' => $now, 'updated_at' => $now,
            ]);
            foreach (DB::table('ipd_form_sections')->orderBy('sort_order')->orderBy('id')->get() as $i => $old) {
                $formId = DB::table('forms')->insertGetId([
                    'form_group_id' => $ipdGroupId,
                    'name'          => $old->label,
                    'sort_order'    => $i + 1,
                    'is_active'     => 1,
                    'created_at'    => $now, 'updated_at' => $now,
                ]);
                DB::table('form_sections')->insert([
                    'form_id' => $formId, 'title' => $old->label,
                    'sort_order' => 1, 'created_at' => $now, 'updated_at' => $now,
                ]);
            }
        }

        // ── ER ───────────────────────────────────────────────────────────────
        if (Schema::hasTable('er_form_sections') && DB::table('er_form_sections')->exists()) {
            $erGroupId = DB::table('form_groups')->insertGetId([
                'name' => 'Emergency Department', 'context' => 'emergency',
                'sort_order' => 3, 'is_active' => 1,
                'created_at' => $now, 'updated_at' => $now,
            ]);
            foreach (DB::table('er_form_sections')->orderBy('sort_order')->orderBy('id')->get() as $i => $old) {
                $formId = DB::table('forms')->insertGetId([
                    'form_group_id' => $erGroupId,
                    'name'          => $old->label,
                    'sort_order'    => $i + 1,
                    'is_active'     => 1,
                    'created_at'    => $now, 'updated_at' => $now,
                ]);
                DB::table('form_sections')->insert([
                    'form_id' => $formId, 'title' => $old->label,
                    'sort_order' => 1, 'created_at' => $now, 'updated_at' => $now,
                ]);
            }
        }

        // ── OT (all three sub-forms share one group) ──────────────────────────
        $hasOtData = (Schema::hasTable('ot_form_sections')        && DB::table('ot_form_sections')->exists())
                   || (Schema::hasTable('ot_intraop_form_sections') && DB::table('ot_intraop_form_sections')->exists())
                   || (Schema::hasTable('ot_postop_form_sections')  && DB::table('ot_postop_form_sections')->exists());

        if ($hasOtData) {
            $otGroupId = DB::table('form_groups')->insertGetId([
                'name' => 'Operation Theater', 'context' => 'ot',
                'sort_order' => 4, 'is_active' => 1,
                'created_at' => $now, 'updated_at' => $now,
            ]);

            if (Schema::hasTable('ot_form_sections') && DB::table('ot_form_sections')->exists()) {
                $otFormId = DB::table('forms')->insertGetId([
                    'form_group_id' => $otGroupId, 'name' => 'Pre-Op Check List',
                    'sort_order' => 1, 'is_active' => 1,
                    'created_at' => $now, 'updated_at' => $now,
                ]);
                foreach (DB::table('ot_form_sections')->orderBy('sort_order')->orderBy('id')->get() as $i => $old) {
                    DB::table('form_sections')->insert([
                        'form_id' => $otFormId, 'title' => $old->label,
                        'sort_order' => $i + 1, 'created_at' => $now, 'updated_at' => $now,
                    ]);
                }
            }

            if (Schema::hasTable('ot_intraop_form_sections') && DB::table('ot_intraop_form_sections')->exists()) {
                $intraopFormId = DB::table('forms')->insertGetId([
                    'form_group_id' => $otGroupId, 'name' => 'Intra-Op Anesthesia Notes',
                    'sort_order' => 2, 'is_active' => 1,
                    'created_at' => $now, 'updated_at' => $now,
                ]);
                foreach (DB::table('ot_intraop_form_sections')->orderBy('sort_order')->orderBy('id')->get() as $i => $old) {
                    DB::table('form_sections')->insert([
                        'form_id' => $intraopFormId, 'title' => $old->label,
                        'sort_order' => $i + 1, 'created_at' => $now, 'updated_at' => $now,
                    ]);
                }
            }

            if (Schema::hasTable('ot_postop_form_sections') && DB::table('ot_postop_form_sections')->exists()) {
                $postopFormId = DB::table('forms')->insertGetId([
                    'form_group_id' => $otGroupId, 'name' => 'Post Op Orders',
                    'sort_order' => 3, 'is_active' => 1,
                    'created_at' => $now, 'updated_at' => $now,
                ]);
                foreach (DB::table('ot_postop_form_sections')->orderBy('sort_order')->orderBy('id')->get() as $i => $old) {
                    DB::table('form_sections')->insert([
                        'form_id' => $postopFormId, 'title' => $old->label,
                        'sort_order' => $i + 1, 'created_at' => $now, 'updated_at' => $now,
                    ]);
                }
            }
        }

        // ── Drop old tables (always) ──────────────────────────────────────────
        Schema::dropIfExists('ot_postop_form_sections');
        Schema::dropIfExists('ot_intraop_form_sections');
        Schema::dropIfExists('ot_form_sections');
        Schema::dropIfExists('er_form_sections');
        Schema::dropIfExists('ipd_form_sections');
        Schema::dropIfExists('opd_form_sections');
    }

    public function down(): void
    {
        // Down intentionally not restoring old tables — backup DB before running up()
        Schema::dropIfExists('form_components');
        Schema::dropIfExists('form_sections');
        Schema::dropIfExists('forms');
        Schema::dropIfExists('form_groups');
    }
};
