<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('doctor_fees', function (Blueprint $table) {
            $table->string('visit_type')->nullable()->after('service_type');
        });
    }

    public function down(): void
    {
        Schema::table('doctor_fees', function (Blueprint $table) {
            $table->dropColumn('visit_type');
        });
    }
};
