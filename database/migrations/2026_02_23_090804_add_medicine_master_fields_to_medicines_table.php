<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('medicines', function (Blueprint $table) {
            $table->string('medicine_name')->nullable()->after('medicine_code');
            $table->string('medicine_type')->nullable()->after('form');
            $table->text('salt_composition')->nullable()->after('strength');
            $table->string('unit_of_measurement')->nullable()->after('salt_composition');
            $table->string('dosage_form')->nullable()->after('unit_of_measurement');
            $table->string('hsn_code')->nullable()->after('dosage_form');
            $table->string('unit_of_purchase')->nullable()->after('hsn_code');
            $table->string('unit_of_sale')->nullable()->after('unit_of_purchase');
            $table->string('shelf_location')->nullable()->after('storage_location');
            $table->string('schedule_type')->nullable()->after('manufacturer');
            $table->boolean('requires_prescription')->default(false)->after('schedule_type');
            $table->string('tax_gst_category')->nullable()->after('selling_price');
        });
    }

    public function down(): void
    {
        Schema::table('medicines', function (Blueprint $table) {
            $table->dropColumn([
                'medicine_name', 'medicine_type', 'salt_composition',
                'unit_of_measurement', 'dosage_form', 'hsn_code',
                'unit_of_purchase', 'unit_of_sale', 'shelf_location',
                'schedule_type', 'requires_prescription', 'tax_gst_category',
            ]);
        });
    }
};
