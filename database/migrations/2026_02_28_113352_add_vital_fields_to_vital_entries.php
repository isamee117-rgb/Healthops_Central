<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vital_entries', function (Blueprint $table) {
            $table->decimal('blood_sugar', 8, 2)->nullable()->after('sp_o2');
            $table->integer('pain_scale')->nullable()->after('blood_sugar');
            $table->text('notes')->nullable()->after('pain_scale');
        });
    }

    public function down(): void
    {
        Schema::table('vital_entries', function (Blueprint $table) {
            $table->dropColumn(['blood_sugar', 'pain_scale', 'notes']);
        });
    }
};
