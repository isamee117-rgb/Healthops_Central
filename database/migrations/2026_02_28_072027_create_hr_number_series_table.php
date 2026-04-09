<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hr_number_series', function (Blueprint $table) {
            $table->id();
            $table->string('series_key')->unique();
            $table->string('label');
            $table->string('prefix');
            $table->unsignedInteger('starting_number')->default(1);
            $table->unsignedInteger('padding')->default(0);
            $table->timestamps();
        });

        DB::table('hr_number_series')->insert([
            [
                'series_key'      => 'doctor_id',
                'label'           => 'Doctor ID',
                'prefix'          => 'DOC-',
                'starting_number' => 1,
                'padding'         => 0,
                'created_at'      => now(),
                'updated_at'      => now(),
            ],
            [
                'series_key'      => 'employee_id',
                'label'           => 'Employee ID',
                'prefix'          => 'EMP-',
                'starting_number' => 1,
                'padding'         => 0,
                'created_at'      => now(),
                'updated_at'      => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('hr_number_series');
    }
};
