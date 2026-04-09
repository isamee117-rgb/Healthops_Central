<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Medicine extends Model
{
    protected $table = 'medicines';

    protected $fillable = [
        'medicine_id', 'medicine_code', 'medicine_name', 'generic_name', 'brand_name',
        'strength', 'salt_composition', 'unit_of_measurement', 'dosage_form',
        'form', 'medicine_type', 'category', 'manufacturer',
        'hsn_code', 'unit_of_purchase', 'unit_of_sale',
        'schedule_type', 'requires_prescription',
        'current_stock', 'min_stock', 'max_stock', 'reorder_point', 'eoq',
        'stock_unit', 'purchase_price', 'selling_price', 'tax_gst_category',
        'storage_location', 'shelf_location', 'storage_conditions',
        'abc_class', 'is_active',
    ];

    protected $casts = [
        'purchase_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'is_active' => 'boolean',
        'requires_prescription' => 'boolean',
    ];

    public function batches()
    {
        return $this->hasMany(MedicineBatch::class, 'medicine_id', 'medicine_id');
    }

    public function transactions()
    {
        return $this->hasMany(StockTransaction::class, 'medicine_id', 'medicine_id');
    }
}
