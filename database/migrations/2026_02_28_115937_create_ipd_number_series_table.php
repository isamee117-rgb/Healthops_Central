<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ipd_number_series', function (Blueprint $table) {
            $table->id();
            $table->string('series_key')->unique();
            $table->string('label');
            $table->string('prefix');
            $table->unsignedInteger('starting_number')->default(1);
            $table->unsignedInteger('padding')->default(0);
            $table->timestamps();
        });

        \Illuminate\Support\Facades\DB::table('ipd_number_series')->insert([
            'series_key'      => 'admission_id',
            'label'           => 'Admission ID',
            'prefix'          => 'IPD-',
            'starting_number' => 1,
            'padding'         => 4,
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('ipd_number_series');
    }
};
