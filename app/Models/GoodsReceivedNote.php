<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GoodsReceivedNote extends Model
{
    protected $table = 'goods_received_notes';

    protected $fillable = [
        'grn_id', 'po_id', 'supplier_id', 'received_date',
        'total_value', 'received_by', 'status', 'notes',
    ];

    protected $casts = [
        'received_date' => 'datetime',
        'total_value' => 'decimal:2',
    ];

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class, 'po_id', 'po_id');
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class, 'supplier_id', 'supplier_id');
    }

    public function items()
    {
        return $this->hasMany(GrnItem::class, 'grn_id', 'grn_id');
    }
}
