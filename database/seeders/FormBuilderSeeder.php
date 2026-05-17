<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FormBuilderSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $groups = [
            [
                'name' => 'Inpatient Department', 'context' => 'ipd', 'sort_order' => 1,
                'forms' => [
                    'General Consent Form', 'Patient Guidelines', 'Investigation Flow Sheet',
                    'Pre-Operative Orders', 'Pre-Op Check List', 'Blood Transfusion Consent',
                    'Informed Consent (Operation)', 'Bed Side Pre-Op Assessment',
                    'Intra-Op Anesthesia Notes', 'Recovery Notes', 'Post Op Orders',
                    'Operation Notes', 'Outcome Summary / Important Notes', 'Discharge Slip (Gynaecology)',
                ],
            ],
            [
                'name' => 'Outpatient Department', 'context' => 'opd', 'sort_order' => 2,
                'forms' => ['Symptoms', 'Investigation Orders', 'Prescription', 'Clinical Notes'],
            ],
            [
                'name' => 'Emergency Department', 'context' => 'emergency', 'sort_order' => 3,
                'forms' => ['History / Examination', 'Case Summary', 'Daily Progress Notes'],
            ],
            [
                'name' => 'Operation Theater', 'context' => 'ot', 'sort_order' => 4,
                'forms' => [
                    'Nutritional Assessment', 'Blood Sugar Levels Chart', 'Partograph',
                    'Vital Sign Chart', 'Intravenous Fluids & Drugs', 'Regular Prescription',
                    'Day / Night Chart', 'Newborn Physical Examination',
                ],
            ],
        ];

        foreach ($groups as $g) {
            $existingGroup = DB::table('form_groups')
                ->where('context', $g['context'])
                ->where('name', $g['name'])
                ->first();

            $groupId = $existingGroup
                ? $existingGroup->id
                : DB::table('form_groups')->insertGetId([
                    'name'       => $g['name'],
                    'context'    => $g['context'],
                    'sort_order' => $g['sort_order'],
                    'is_active'  => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);

            foreach ($g['forms'] as $i => $formName) {
                $exists = DB::table('forms')
                    ->where('form_group_id', $groupId)
                    ->where('name', $formName)
                    ->exists();

                if ($exists) {
                    continue;
                }

                $formId = DB::table('forms')->insertGetId([
                    'form_group_id' => $groupId,
                    'name'          => $formName,
                    'sort_order'    => $i + 1,
                    'is_active'     => 1,
                    'created_at'    => $now,
                    'updated_at'    => $now,
                ]);

                DB::table('form_sections')->insert([
                    'form_id'    => $formId,
                    'title'      => $formName,
                    'sort_order' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }
    }
}
