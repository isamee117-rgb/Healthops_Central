<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_reagents', function (Blueprint $table) {
            $table->string('reagent_id', 20)->primary();
            $table->string('reagent_code', 20)->unique();
            $table->string('name');
            $table->string('category');
            $table->string('sub_category')->nullable();
            $table->string('manufacturer');
            $table->string('catalog_number')->nullable();
            $table->string('unit');
            $table->integer('current_stock')->default(0);
            $table->integer('min_stock')->default(0);
            $table->integer('max_stock')->default(0);
            $table->integer('reorder_point')->default(0);
            $table->decimal('unit_price', 12, 2)->default(0);
            $table->string('storage_condition');
            $table->string('storage_temp_range')->nullable();
            $table->string('storage_location')->nullable();
            $table->string('analyzer_name')->nullable();
            $table->integer('tests_per_kit')->nullable();
            $table->integer('remaining_tests')->nullable();
            $table->string('status')->default('Active');
            $table->boolean('auto_reorder')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('lab_reagent_batches', function (Blueprint $table) {
            $table->string('batch_id', 20)->primary();
            $table->string('reagent_id', 20);
            $table->string('lot_number');
            $table->string('batch_number');
            $table->date('received_date');
            $table->date('expiry_date');
            $table->date('opened_date')->nullable();
            $table->integer('qty_received')->default(0);
            $table->integer('current_qty')->default(0);
            $table->decimal('unit_price', 12, 2)->default(0);
            $table->string('supplier')->nullable();
            $table->string('status')->default('Active');
            $table->boolean('qc_verified')->default(false);
            $table->timestamp('qc_verified_at')->nullable();
            $table->string('qc_verified_by')->nullable();
            $table->text('qc_notes')->nullable();
            $table->json('linked_results')->nullable();
            $table->timestamps();
            $table->foreign('reagent_id')->references('reagent_id')->on('lab_reagents')->onDelete('cascade');
        });

        Schema::create('lab_stock_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('reagent_id', 20);
            $table->string('batch_id', 20)->nullable();
            $table->string('type');
            $table->integer('quantity');
            $table->integer('balance_after')->default(0);
            $table->string('reason')->nullable();
            $table->string('reference')->nullable();
            $table->string('performed_by')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->foreign('reagent_id')->references('reagent_id')->on('lab_reagents')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_stock_transactions');
        Schema::dropIfExists('lab_reagent_batches');
        Schema::dropIfExists('lab_reagents');
    }
};
