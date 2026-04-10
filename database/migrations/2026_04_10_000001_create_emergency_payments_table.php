<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('emergency_payments', function (Blueprint $table) {
            $table->id();
            $table->string('payment_id')->unique();
            $table->string('bill_id');
            $table->string('visit_id');
            $table->string('mrn');
            $table->decimal('amount', 12, 2);
            $table->string('payment_mode')->default('Cash');
            $table->string('receipt_number')->nullable();
            $table->string('reference')->nullable();
            $table->string('received_by')->default('Admin / Sys');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        if (!Schema::hasColumn('emergency_bills', 'paid_amount')) {
            Schema::table('emergency_bills', function (Blueprint $table) {
                $table->decimal('paid_amount', 12, 2)->default(0)->after('total_amount');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('emergency_payments');

        if (Schema::hasColumn('emergency_bills', 'paid_amount')) {
            Schema::table('emergency_bills', function (Blueprint $table) {
                $table->dropColumn('paid_amount');
            });
        }
    }
};
