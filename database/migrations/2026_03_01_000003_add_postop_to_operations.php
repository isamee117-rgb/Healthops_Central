<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('operations', function (Blueprint $table) {
            $table->json('postop_notes')->nullable()->after('intraop_record');
            $table->string('postop_location')->nullable()->after('postop_notes');
            $table->date('expected_discharge_date')->nullable()->after('postop_location');
            $table->boolean('discharged')->default(false)->after('expected_discharge_date');
        });
    }

    public function down(): void
    {
        Schema::table('operations', function (Blueprint $table) {
            $table->dropColumn(['postop_notes', 'postop_location', 'expected_discharge_date', 'discharged']);
        });
    }
};
