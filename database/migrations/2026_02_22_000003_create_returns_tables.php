<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patient_returns', function (Blueprint $table) {
            $table->id();
            $table->string('return_id')->unique();
            $table->date('return_date');
            $table->string('patient_name');
            $table->string('mrn');
            $table->string('order_id')->nullable();
            $table->date('purchase_date')->nullable();
            $table->string('medicine_name');
            $table->string('medicine_id')->nullable();
            $table->string('batch_number')->nullable();
            $table->string('expiry_date')->nullable();
            $table->integer('quantity')->default(0);
            $table->string('unit')->default('strips');
            $table->string('reason');
            $table->text('patient_notes')->nullable();
            $table->string('condition')->default('Unopened');
            $table->boolean('can_restock')->default(false);
            $table->decimal('original_amount', 12, 2)->default(0);
            $table->decimal('refund_amount', 12, 2)->default(0);
            $table->string('refund_method')->nullable();
            $table->string('status')->default('Pending');
            $table->string('processed_by')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('ward_returns', function (Blueprint $table) {
            $table->id();
            $table->string('return_id')->unique();
            $table->string('ward_name');
            $table->date('return_date');
            $table->jsonb('items');
            $table->integer('items_count')->default(0);
            $table->decimal('total_value', 12, 2)->default(0);
            $table->string('status')->default('Pending');
            $table->string('received_by')->nullable();
            $table->string('processed_by')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('supplier_returns', function (Blueprint $table) {
            $table->id();
            $table->string('rtv_id')->unique();
            $table->string('supplier_id');
            $table->string('supplier_name');
            $table->string('po_reference')->nullable();
            $table->date('return_date');
            $table->jsonb('items');
            $table->integer('items_count')->default(0);
            $table->string('reason');
            $table->text('notes')->nullable();
            $table->decimal('total_credit', 12, 2)->default(0);
            $table->string('status')->default('Draft');
            $table->string('created_by')->nullable();
            $table->timestamps();
        });

        Schema::create('disposal_records', function (Blueprint $table) {
            $table->id();
            $table->string('disposal_id')->unique();
            $table->jsonb('items');
            $table->integer('items_count')->default(0);
            $table->decimal('total_loss', 12, 2)->default(0);
            $table->string('disposal_method')->nullable();
            $table->string('disposal_facility')->nullable();
            $table->string('certificate_number')->nullable();
            $table->date('disposal_date')->nullable();
            $table->string('witness_1')->nullable();
            $table->string('witness_2')->nullable();
            $table->string('disposed_by')->nullable();
            $table->string('authorized_by')->nullable();
            $table->string('status')->default('Pending');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disposal_records');
        Schema::dropIfExists('supplier_returns');
        Schema::dropIfExists('ward_returns');
        Schema::dropIfExists('patient_returns');
    }
};
