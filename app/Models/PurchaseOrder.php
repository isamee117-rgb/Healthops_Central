<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseOrder extends Model
{
    protected $table = 'purchase_orders';

    protected $fillable = [
        'po_id', 'supplier_id', 'po_date', 'expected_delivery',
        'order_type', 'subtotal', 'tax', 'discount', 'total',
        'payment_method', 'credit_days', 'advance_payment',
        'delivery_instructions', 'notes', 'status', 'created_by',
    ];

    protected $casts = [
        'po_date' => 'date',
        'expected_delivery' => 'date',
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
        'advance_payment' => 'decimal:2',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class, 'supplier_id', 'supplier_id');
    }

    public function items()
    {
        return $this->hasMany(PurchaseOrderItem::class, 'po_id', 'po_id');
    }

    public function grns()
    {
        return $this->hasMany(GoodsReceivedNote::class, 'po_id', 'po_id');
    }
}
