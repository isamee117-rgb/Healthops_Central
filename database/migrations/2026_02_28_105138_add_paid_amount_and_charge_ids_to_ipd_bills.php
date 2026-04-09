<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ipd_bills', function (Blueprint $table) {
            if (!Schema::hasColumn('ipd_bills', 'paid_amount')) {
                $table->decimal('paid_amount', 12, 2)->default(0)->after('total_amount');
            }
            if (!Schema::hasColumn('ipd_bills', 'charge_ids')) {
                $table->json('charge_ids')->nullable()->after('history');
            }
        });
    }

    public function down(): void
    {
        Schema::table('ipd_bills', function (Blueprint $table) {
            $table->dropColumn(['paid_amount', 'charge_ids']);
        });
    }
};
