<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('account_heads', function (Blueprint $table) {
            $table->id();
            $table->string('head_id')->unique();
            $table->string('category');
            $table->string('head_type');
            $table->string('head_name');
            $table->string('head_code')->unique();
            $table->text('description')->nullable();
            $table->decimal('budget_limit', 12, 2)->nullable();
            $table->string('gl_account_code')->nullable();
            $table->string('status')->default('Active');
            $table->string('created_by')->default('Admin');
            $table->timestamps();
        });

        Schema::table('finance_transactions', function (Blueprint $table) {
            $table->string('head_id')->nullable()->after('head');
            $table->string('transaction_type')->nullable()->after('type');
            $table->text('description')->nullable()->after('remarks');
            $table->string('payment_mode')->nullable()->after('amount');
            $table->string('reference_number')->nullable()->after('payment_mode');
            $table->timestamp('posted_at')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('account_heads');

        Schema::table('finance_transactions', function (Blueprint $table) {
            $table->dropColumn(['head_id', 'transaction_type', 'description', 'payment_mode', 'reference_number']);
        });
    }
};
