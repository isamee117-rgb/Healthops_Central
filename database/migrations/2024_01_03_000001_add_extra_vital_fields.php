<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('opd_vitals', function (Blueprint $table) {
            $table->integer('respiratory_rate')->nullable()->after('sp_o2');
            $table->decimal('weight', 5, 2)->nullable()->after('respiratory_rate');
            $table->integer('blood_sugar')->nullable()->after('weight');
            $table->integer('pain_scale')->nullable()->after('blood_sugar');
        });
    }

    public function down(): void
    {
        Schema::table('opd_vitals', function (Blueprint $table) {
            $table->dropColumn(['respiratory_rate', 'weight', 'blood_sugar', 'pain_scale']);
        });
    }
};
