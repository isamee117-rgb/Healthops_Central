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
        Schema::create('opd_number_series', function (Blueprint $table) {
            $table->id();
            $table->string('series_key')->unique();
            $table->string('label');
            $table->string('prefix');
            $table->unsignedInteger('starting_number')->default(1);
            $table->unsignedInteger('padding')->default(0);
            $table->timestamps();
        });

        \Illuminate\Support\Facades\DB::table('opd_number_series')->insert([
            'series_key'      => 'visit_id',
            'label'           => 'Visit ID',
            'prefix'          => 'OPD-',
            'starting_number' => 1,
            'padding'         => 0,
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('opd_number_series');
    }
};
