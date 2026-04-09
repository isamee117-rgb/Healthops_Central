<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pharmacy_transactions', function (Blueprint $table) {
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
            $table->string('received_by')->default('Cashier');
            $table->json('items')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('panel_claims', function (Blueprint $table) {
            $table->id();
            $table->string('claim_id')->unique();
            $table->string('patient_name');
            $table->string('mrn')->nullable();
            $table->string('company');
            $table->date('claim_date');
            $table->decimal('claim_amount', 12, 2)->default(0);
            $table->string('status')->default('Submitted');
            $table->string('policy_number')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
        });

        Schema::create('cash_reconciliations', function (Blueprint $table) {
            $table->id();
            $table->string('reconciliation_id')->unique();
            $table->date('reconciliation_date');
            $table->string('shift')->default('Morning (7 AM - 3 PM)');
            $table->string('pharmacist')->default('Admin');
            $table->decimal('opening_balance', 12, 2)->default(0);
            $table->decimal('cash_sales', 12, 2)->default(0);
            $table->decimal('payments_received', 12, 2)->default(0);
            $table->decimal('returns_refunds', 12, 2)->default(0);
            $table->decimal('expected_closing', 12, 2)->default(0);
            $table->json('denominations')->nullable();
            $table->decimal('actual_cash', 12, 2)->default(0);
            $table->decimal('variance', 12, 2)->default(0);
            $table->string('variance_type')->nullable();
            $table->text('variance_reason')->nullable();
            $table->string('authorized_by')->nullable();
            $table->decimal('bank_deposit_amount', 12, 2)->default(0);
            $table->decimal('remaining_float', 12, 2)->default(0);
            $table->string('deposited_by')->nullable();
            $table->string('deposit_slip_no')->nullable();
            $table->string('status')->default('Draft');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_reconciliations');
        Schema::dropIfExists('panel_claims');
        Schema::dropIfExists('pharmacy_transactions');
    }
};
