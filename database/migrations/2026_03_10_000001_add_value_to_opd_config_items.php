<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('opd_config_items', function (Blueprint $table) {
            $table->integer('value')->nullable()->after('sort_order');
        });

        $defaults = [
            'OD (Once Daily)'          => 1,
            'BD (Twice Daily)'         => 2,
            'TDS (Three Times Daily)'  => 3,
            'QID (Four Times Daily)'   => 4,
            'PRN (As Needed)'          => 0,
            'SOS (If Required)'        => 0,
            'QHS (At Bedtime)'         => 1,
            'Q4H (Every 4 Hours)'      => 6,
            'Q6H (Every 6 Hours)'      => 4,
            'Q8H (Every 8 Hours)'      => 3,
            'Stat (Immediately)'       => 1,
        ];

        foreach ($defaults as $name => $val) {
            DB::table('opd_config_items')
                ->where('category', 'rx_frequency')
                ->where('name', $name)
                ->whereNull('value')
                ->update(['value' => $val]);
        }
    }

    public function down(): void
    {
        Schema::table('opd_config_items', function (Blueprint $table) {
            $table->dropColumn('value');
        });
    }
};
