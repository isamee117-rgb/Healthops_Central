<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $tables = ['opd_visits', 'ipd_admissions', 'emergency_visits', 'operations'];

        foreach ($tables as $table) {
            if (Schema::hasTable($table) && !Schema::hasColumn($table, 'registered_by')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->string('registered_by')->nullable()->after('status');
                });
            }
        }
    }

    public function down(): void
    {
        $tables = ['opd_visits', 'ipd_admissions', 'emergency_visits', 'operations'];

        foreach ($tables as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'registered_by')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->dropColumn('registered_by');
                });
            }
        }
    }
};
