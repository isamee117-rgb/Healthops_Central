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
        Schema::table('opd_vitals', function (Blueprint $table) {
            if (!Schema::hasColumn('opd_vitals', 'height'))              $table->decimal('height', 5, 1)->nullable()->after('pain_scale');
            if (!Schema::hasColumn('opd_vitals', 'temperature_c'))       $table->decimal('temperature_c', 5, 2)->nullable()->after('height');
            if (!Schema::hasColumn('opd_vitals', 'bmi'))                 $table->decimal('bmi', 5, 2)->nullable()->after('temperature_c');
            if (!Schema::hasColumn('opd_vitals', 'head_circumference'))  $table->decimal('head_circumference', 5, 1)->nullable()->after('bmi');
            if (!Schema::hasColumn('opd_vitals', 'waist_circumference')) $table->decimal('waist_circumference', 5, 1)->nullable()->after('head_circumference');
            if (!Schema::hasColumn('opd_vitals', 'urine_output'))        $table->decimal('urine_output', 8, 1)->nullable()->after('waist_circumference');
            if (!Schema::hasColumn('opd_vitals', 'glasgow_coma'))        $table->unsignedTinyInteger('glasgow_coma')->nullable()->after('urine_output');
        });
    }

    public function down(): void
    {
        Schema::table('opd_vitals', function (Blueprint $table) {
            foreach (['glasgow_coma', 'urine_output', 'waist_circumference', 'head_circumference', 'bmi', 'temperature_c', 'height'] as $col) {
                if (Schema::hasColumn('opd_vitals', $col)) $table->dropColumn($col);
            }
        });
    }
};
