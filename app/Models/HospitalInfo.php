<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HospitalInfo extends Model
{
    protected $table = 'hospital_info';

    protected $fillable = [
        'name',
        'short_name',
        'logo',
        'registration_number',
        'ntn',
        'health_authority_reg',
        'primary_phone',
        'secondary_phone',
        'email',
        'website',
        'address',
        'city',
        'province',
        'country',
        'postal_code',
        'invoice_header',
        'invoice_footer',
        'currency',
        'tax_percentage',
        'invoice_prefix',
    ];

    protected $casts = [
        'tax_percentage' => 'decimal:2',
    ];
}
