<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hr_config_items', function (Blueprint $table) {
            $table->id();
            $table->string('category', 50);
            $table->string('name', 150);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['category', 'name']);
            $table->index('category');
        });

        $this->seedDefaults();
    }

    private function seedDefaults(): void
    {
        $now = now();
        $items = [];

        $specializations = ['General Physician','Cardiologist','Orthopedic Surgeon','Pediatrician','Gynecologist','Neurologist','Dermatologist','ENT Specialist','Ophthalmologist','General Surgeon','Urologist','Radiologist','Anesthesiologist','Psychiatrist','Oncologist','Pulmonologist','Nephrologist','Gastroenterologist','Endocrinologist','Trauma Surgeon'];
        foreach ($specializations as $i => $name) {
            $items[] = ['category' => 'specialization', 'name' => $name, 'sort_order' => $i, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now];
        }

        $departments = ['Cardiology','Orthopedics','Pediatrics','General Medicine','Surgery','Neurology','Dermatology','ENT','Ophthalmology','Gynecology','Urology','Radiology','Anesthesiology','Emergency','Psychiatry','Oncology','Pulmonology','Nephrology','Gastroenterology','Endocrinology'];
        foreach ($departments as $i => $name) {
            $items[] = ['category' => 'department', 'name' => $name, 'sort_order' => $i, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now];
        }

        $designations = ['Medical Officer','Senior Medical Officer','Registrar','Senior Registrar','Assistant Professor','Associate Professor','Professor','Head of Department (HOD)','Medical Director','Chief Medical Officer'];
        foreach ($designations as $i => $name) {
            $items[] = ['category' => 'designation', 'name' => $name, 'sort_order' => $i, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now];
        }

        $employmentTypes = ['Full-time','Part-time','Visiting','Consultant','Honorary'];
        foreach ($employmentTypes as $i => $name) {
            $items[] = ['category' => 'employment_type', 'name' => $name, 'sort_order' => $i, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now];
        }

        $subSpecializations = ['Interventional Cardiology','Pediatric Surgery','Neonatology','Cardiac Surgery','Neurosurgery','Plastic Surgery','Vascular Surgery','Spine Surgery','Joint Replacement','Sports Medicine'];
        foreach ($subSpecializations as $i => $name) {
            $items[] = ['category' => 'sub_specialization', 'name' => $name, 'sort_order' => $i, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now];
        }

        DB::table('hr_config_items')->insert($items);
    }

    public function down(): void
    {
        Schema::dropIfExists('hr_config_items');
    }
};
