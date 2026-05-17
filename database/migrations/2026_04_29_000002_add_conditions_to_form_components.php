<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('form_components', function (Blueprint $table) {
            $table->json('conditions')->nullable()->after('config');
        });
    }

    public function down(): void
    {
        Schema::table('form_components', function (Blueprint $table) {
            $table->dropColumn('conditions');
        });
    }
};
