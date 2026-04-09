<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LabTest extends Model
{
    protected $table = 'lab_tests';
    protected $primaryKey = 'test_code';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'test_code', 'test_name', 'test_name_urdu', 'short_name', 'alt_names',
        'department', 'category', 'description', 'clinical_significance',
        'sample_type', 'sample_volume', 'collection_container', 'num_tubes',
        'fasting_required', 'fasting_hours', 'special_instructions',
        'sample_stability', 'transport_requirements', 'special_handling',
        'has_components', 'components',
        'standard_tat', 'stat_tat', 'stat_additional_charge', 'tat_notes',
        'standard_price', 'stat_price', 'panel_rates', 'sehat_card_rate',
        'home_collection_fee', 'reagent_cost', 'cost_per_test',
        'indications', 'common_diagnoses', 'interpretation_guidelines',
        'interfering_factors', 'related_tests', 'patient_preparation',
        'methodology', 'equipment', 'accreditation', 'internal_notes',
        'status', 'available_in', 'reference_lab_name', 'reference_lab_tat',
        'reference_lab_cost', 'order_count',
    ];

    protected $casts = [
        'sample_stability' => 'array',
        'special_handling' => 'array',
        'components' => 'array',
        'panel_rates' => 'array',
        'common_diagnoses' => 'array',
        'related_tests' => 'array',
        'accreditation' => 'array',
        'available_in' => 'array',
        'has_components' => 'boolean',
        'standard_price' => 'decimal:2',
        'stat_price' => 'decimal:2',
    ];
}
