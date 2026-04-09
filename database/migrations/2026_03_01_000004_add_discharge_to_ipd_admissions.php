<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('ipd_admissions', function (Blueprint $table) {
            $table->string('discharge_status')->nullable()->after('status');
            $table->json('discharge_info')->nullable()->after('discharge_status');
        });
    }
    public function down(): void {
        Schema::table('ipd_admissions', function (Blueprint $table) {
            $table->dropColumn(['discharge_status', 'discharge_info']);
        });
    }
};
