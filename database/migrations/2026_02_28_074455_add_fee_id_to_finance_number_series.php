<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('finance_number_series')->insertOrIgnore([
            [
                'series_key'      => 'fee_id',
                'label'           => 'Doctor Fee ID',
                'prefix'          => 'FEE-',
                'starting_number' => 1,
                'padding'         => 0,
                'created_at'      => now(),
                'updated_at'      => now(),
            ],
        ]);
    }

    public function down(): void
    {
        DB::table('finance_number_series')->where('series_key', 'fee_id')->delete();
    }
};
