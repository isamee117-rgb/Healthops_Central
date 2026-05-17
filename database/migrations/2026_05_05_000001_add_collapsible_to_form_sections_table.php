<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('form_sections', function (Blueprint $table) {
            $table->text('description')->nullable()->after('title');
            $table->boolean('is_collapsible')->default(false)->after('description');
        });
    }
    public function down(): void {
        Schema::table('form_sections', function (Blueprint $table) {
            $table->dropColumn(['description', 'is_collapsible']);
        });
    }
};
