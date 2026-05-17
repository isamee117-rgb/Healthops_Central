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
        if (!Schema::hasColumn('opd_bills', 'charge_ids')) {
            Schema::table('opd_bills', function (Blueprint $table) {
                $table->json('charge_ids')->nullable()->after('history');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('opd_bills', 'charge_ids')) {
            Schema::table('opd_bills', function (Blueprint $table) {
                $table->dropColumn('charge_ids');
            });
        }
    }
};
