<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medicines', function (Blueprint $table) {
            $table->id();
            $table->string('medicine_id')->unique();
            $table->string('medicine_code')->unique();
            $table->string('generic_name');
            $table->string('brand_name');
            $table->string('strength')->nullable();
            $table->string('form');
            $table->string('category');
            $table->string('manufacturer');
            $table->integer('current_stock')->default(0);
            $table->integer('min_stock')->default(0);
            $table->integer('max_stock')->default(0);
            $table->integer('reorder_point')->default(0);
            $table->integer('eoq')->default(0);
            $table->string('stock_unit')->default('strips');
            $table->decimal('purchase_price', 10, 2)->default(0);
            $table->decimal('selling_price', 10, 2)->default(0);
            $table->string('storage_location')->nullable();
            $table->string('storage_conditions')->nullable();
            $table->string('abc_class')->default('C');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index('category');
            $table->index('form');
            $table->index('manufacturer');
            $table->index('abc_class');
        });

        Schema::create('medicine_batches', function (Blueprint $table) {
            $table->id();
            $table->string('batch_id')->unique();
            $table->string('batch_number');
            $table->string('medicine_id');
            $table->date('received_date');
            $table->date('expiry_date');
            $table->integer('qty_received')->default(0);
            $table->integer('current_qty')->default(0);
            $table->decimal('unit_price', 10, 2)->default(0);
            $table->string('supplier')->nullable();
            $table->string('status')->default('Active');
            $table->timestamps();
            $table->index('medicine_id');
            $table->index('expiry_date');
            $table->index('status');
        });

        Schema::create('stock_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_id')->unique();
            $table->string('medicine_id');
            $table->string('batch_id')->nullable();
            $table->string('type');
            $table->integer('quantity');
            $table->integer('stock_before')->default(0);
            $table->integer('stock_after')->default(0);
            $table->string('reason')->nullable();
            $table->string('reference')->nullable();
            $table->text('notes')->nullable();
            $table->string('performed_by')->default('Admin');
            $table->timestamps();
            $table->index('medicine_id');
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_transactions');
        Schema::dropIfExists('medicine_batches');
        Schema::dropIfExists('medicines');
    }
};
