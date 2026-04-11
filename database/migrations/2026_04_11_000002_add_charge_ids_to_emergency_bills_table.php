<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('emergency_bills', function (Blueprint $table) {
            $table->json('charge_ids')->nullable()->after('consultation_charges');
        });
    }

    public function down(): void
    {
        Schema::table('emergency_bills', function (Blueprint $table) {
            $table->dropColumn('charge_ids');
        });
    }
};
