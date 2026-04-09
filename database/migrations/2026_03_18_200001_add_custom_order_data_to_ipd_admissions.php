<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ipd_admissions', function (Blueprint $table) {
            $table->json('custom_order_data')->nullable()->after('discharge_info');
        });
    }

    public function down(): void
    {
        Schema::table('ipd_admissions', function (Blueprint $table) {
            $table->dropColumn('custom_order_data');
        });
    }
};
