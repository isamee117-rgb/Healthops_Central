<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('supplier_id')->unique();
            $table->string('name');
            $table->string('contact_person')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->string('payment_terms')->nullable();
            $table->integer('lead_time_days')->default(5);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->string('po_id')->unique();
            $table->string('supplier_id');
            $table->date('po_date');
            $table->date('expected_delivery')->nullable();
            $table->string('order_type')->default('Regular Stock Replenishment');
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('tax', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            $table->string('payment_method')->default('Credit');
            $table->integer('credit_days')->default(30);
            $table->decimal('advance_payment', 12, 2)->default(0);
            $table->text('delivery_instructions')->nullable();
            $table->text('notes')->nullable();
            $table->string('status')->default('Draft');
            $table->string('created_by')->nullable();
            $table->timestamps();
        });

        Schema::create('purchase_order_items', function (Blueprint $table) {
            $table->id();
            $table->string('po_id');
            $table->string('medicine_id');
            $table->integer('quantity')->default(0);
            $table->decimal('unit_price', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            $table->integer('received_qty')->default(0);
            $table->timestamps();
        });

        Schema::create('goods_received_notes', function (Blueprint $table) {
            $table->id();
            $table->string('grn_id')->unique();
            $table->string('po_id');
            $table->string('supplier_id');
            $table->datetime('received_date');
            $table->decimal('total_value', 12, 2)->default(0);
            $table->string('received_by')->nullable();
            $table->string('status')->default('Completed');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('grn_items', function (Blueprint $table) {
            $table->id();
            $table->string('grn_id');
            $table->string('medicine_id');
            $table->integer('expected_qty')->default(0);
            $table->integer('received_qty')->default(0);
            $table->string('batch_number')->nullable();
            $table->date('manufacturing_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->decimal('unit_price', 12, 2)->default(0);
            $table->json('quality_checks')->nullable();
            $table->text('remarks')->nullable();
            $table->boolean('accepted')->default(true);
            $table->timestamps();
        });

        \DB::table('suppliers')->insert([
            ['supplier_id' => 'SUP-1', 'name' => 'MedPharma Distributors', 'contact_person' => 'Ali Hassan', 'phone' => '0321-1234567', 'email' => 'orders@medpharma.pk', 'address' => 'Karachi', 'payment_terms' => 'Net 30', 'lead_time_days' => 3, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['supplier_id' => 'SUP-2', 'name' => 'Global Health Supplies', 'contact_person' => 'Sara Khan', 'phone' => '0333-9876543', 'email' => 'sales@globalhealth.pk', 'address' => 'Lahore', 'payment_terms' => 'Net 45', 'lead_time_days' => 5, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['supplier_id' => 'SUP-3', 'name' => 'PharmaWholesale Ltd', 'contact_person' => 'Ahmed Raza', 'phone' => '0300-5551234', 'email' => 'contact@pharmawholesale.pk', 'address' => 'Islamabad', 'payment_terms' => 'Net 30', 'lead_time_days' => 7, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('grn_items');
        Schema::dropIfExists('goods_received_notes');
        Schema::dropIfExists('purchase_order_items');
        Schema::dropIfExists('purchase_orders');
        Schema::dropIfExists('suppliers');
    }
};
