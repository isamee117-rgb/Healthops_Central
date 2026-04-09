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
        Schema::create('opd_vital_fields', function (Blueprint $table) {
            $table->id();
            $table->string('field_key')->unique();
            $table->string('label');
            $table->string('icon')->default('activity');
            $table->string('unit')->nullable();
            $table->string('input_type')->default('number');
            $table->boolean('is_visible')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        $fields = [
            ['field_key' => 'temperature',        'label' => 'Temperature (°F)',       'icon' => 'thermometer',     'unit' => '°F',     'input_type' => 'number',       'is_visible' => true,  'sort_order' => 1],
            ['field_key' => 'blood_pressure',      'label' => 'Blood Pressure',         'icon' => 'heart',           'unit' => 'mmHg',   'input_type' => 'blood_pressure','is_visible' => true,  'sort_order' => 2],
            ['field_key' => 'heart_rate',          'label' => 'Heart Rate / Pulse',     'icon' => 'activity',        'unit' => 'bpm',    'input_type' => 'number',       'is_visible' => true,  'sort_order' => 3],
            ['field_key' => 'respiratory_rate',    'label' => 'Respiratory Rate',       'icon' => 'wind',            'unit' => '/min',   'input_type' => 'number',       'is_visible' => true,  'sort_order' => 4],
            ['field_key' => 'sp_o2',               'label' => 'SpO2',                   'icon' => 'droplets',        'unit' => '%',      'input_type' => 'number',       'is_visible' => true,  'sort_order' => 5],
            ['field_key' => 'blood_sugar',         'label' => 'Blood Sugar',            'icon' => 'droplets',        'unit' => 'mg/dL',  'input_type' => 'number',       'is_visible' => true,  'sort_order' => 6],
            ['field_key' => 'weight',              'label' => 'Weight',                 'icon' => 'scale',           'unit' => 'kg',     'input_type' => 'number',       'is_visible' => true,  'sort_order' => 7],
            ['field_key' => 'pain_scale',          'label' => 'Pain Scale',             'icon' => 'zap',             'unit' => '0–10',   'input_type' => 'pain_scale',   'is_visible' => true,  'sort_order' => 8],
            ['field_key' => 'height',              'label' => 'Height',                 'icon' => 'ruler',           'unit' => 'cm',     'input_type' => 'number',       'is_visible' => false, 'sort_order' => 9],
            ['field_key' => 'temperature_c',       'label' => 'Temperature (°C)',       'icon' => 'thermometer',     'unit' => '°C',     'input_type' => 'number',       'is_visible' => false, 'sort_order' => 10],
            ['field_key' => 'bmi',                 'label' => 'BMI',                    'icon' => 'calculator',      'unit' => 'kg/m²',  'input_type' => 'number',       'is_visible' => false, 'sort_order' => 11],
            ['field_key' => 'head_circumference',  'label' => 'Head Circumference',     'icon' => 'circle',          'unit' => 'cm',     'input_type' => 'number',       'is_visible' => false, 'sort_order' => 12],
            ['field_key' => 'waist_circumference', 'label' => 'Waist Circumference',    'icon' => 'circle',          'unit' => 'cm',     'input_type' => 'number',       'is_visible' => false, 'sort_order' => 13],
            ['field_key' => 'urine_output',        'label' => 'Urine Output',           'icon' => 'droplets',        'unit' => 'mL',     'input_type' => 'number',       'is_visible' => false, 'sort_order' => 14],
            ['field_key' => 'glasgow_coma',        'label' => 'Glasgow Coma Scale',     'icon' => 'brain',           'unit' => '/15',    'input_type' => 'number',       'is_visible' => false, 'sort_order' => 15],
        ];

        foreach ($fields as $f) {
            \Illuminate\Support\Facades\DB::table('opd_vital_fields')->insert(array_merge($f, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('opd_vital_fields');
    }
};
