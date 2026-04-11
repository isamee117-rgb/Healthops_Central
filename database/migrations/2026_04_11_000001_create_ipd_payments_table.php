<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ipd_payments', function (Blueprint $table) {
            $table->string('payment_id')->primary();
            $table->string('bill_id');
            $table->string('admission_id');
            $table->string('mrn');
            $table->decimal('amount', 12, 2);
            $table->string('payment_mode');
            $table->string('receipt_number')->nullable();
            $table->string('reference')->nullable();
            $table->json('charge_ids')->nullable();
            $table->string('received_by')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('bill_id');
            $table->index('admission_id');
            $table->index('mrn');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ipd_payments');
    }
};
