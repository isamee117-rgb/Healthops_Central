<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_id')->unique();
            $table->dateTime('transaction_date');
            $table->string('patient_name');
            $table->string('mrn')->nullable();
            $table->string('department');
            $table->string('order_id')->nullable();
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('tax', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->string('payment_mode')->default('Cash');
            $table->string('payment_status')->default('Paid');
            $table->string('billed_to')->default('Patient');
            $table->boolean('charge_posted')->default(true);
            $table->string('reconciliation_status')->default('Matched');
            $table->string('receipt_number')->nullable();
            $table->string('billing_reference')->nullable();
            $table->string('ordered_by')->nullable();
            $table->string('processed_by')->default('Lab Staff');
            $table->json('items')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_transactions');
    }
};
