<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('operations', function (Blueprint $table) {
            $table->json('intraop_record')->nullable()->after('checklist_status');
            $table->string('current_phase')->nullable()->after('intraop_record');
            $table->string('anesthesia_start_time')->nullable()->after('current_phase');
        });
    }

    public function down(): void
    {
        Schema::table('operations', function (Blueprint $table) {
            $table->dropColumn(['intraop_record', 'current_phase', 'anesthesia_start_time']);
        });
    }
};
