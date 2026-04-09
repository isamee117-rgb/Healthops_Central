<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('opd_bills', function (Blueprint $table) {
            $table->jsonb('additional_charges')->nullable()->after('charge_ids');
        });
    }

    public function down(): void
    {
        Schema::table('opd_bills', function (Blueprint $table) {
            $table->dropColumn('additional_charges');
        });
    }
};
