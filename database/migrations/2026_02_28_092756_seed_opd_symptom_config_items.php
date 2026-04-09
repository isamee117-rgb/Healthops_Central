<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $symptoms = [
            'Fever', 'Cough', 'Cold', 'Headache', 'Body Ache', 'Fatigue', 'Nausea', 'Vomiting',
            'Diarrhea', 'Constipation', 'Abdominal Pain', 'Chest Pain', 'Back Pain', 'Joint Pain',
            'Sore Throat', 'Runny Nose', 'Shortness of Breath', 'Dizziness', 'Weakness', 'Weight Loss',
            'Weight Gain', 'Loss of Appetite', 'Excessive Thirst', 'Frequent Urination', 'Burning Urination',
            'Blood in Urine', 'Blood in Stool', 'Skin Rash', 'Itching', 'Swelling', 'Numbness',
            'Tingling', 'Blurred Vision', 'Ear Pain', 'Difficulty Swallowing', 'Heartburn', 'Bloating',
            'Muscle Cramps', 'Night Sweats', 'Insomnia', 'Anxiety', 'Depression', 'Palpitations',
            'Wheezing', 'Sneezing', 'Nasal Congestion', 'Eye Redness', 'Excessive Sweating',
            'Dry Mouth', 'Hair Loss', 'Bruising', 'Bleeding Gums', 'Tooth Pain', 'Neck Pain',
            'Shoulder Pain', 'Knee Pain', 'Hip Pain', 'Ankle Swelling', 'Leg Cramps',
            'Chest Tightness', 'Irregular Heartbeat', 'Fainting', 'Memory Loss', 'Confusion',
            'Seizures', 'Tremors', 'Paralysis', 'Difficulty Speaking', 'Ringing in Ears',
            'Loss of Smell', 'Loss of Taste', 'Yellowing of Skin', 'Dark Urine', 'Pale Stools',
        ];

        foreach ($symptoms as $i => $name) {
            \Illuminate\Support\Facades\DB::table('opd_config_items')->insert([
                'category'   => 'opd_symptom',
                'name'       => $name,
                'is_active'  => true,
                'sort_order' => $i,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        \Illuminate\Support\Facades\DB::table('opd_config_items')
            ->where('category', 'opd_symptom')
            ->delete();
    }
};
