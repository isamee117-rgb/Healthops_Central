<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LabReport extends Model
{
    protected $table = 'lab_reports';

    protected $fillable = [
        'report_id', 'lab_order_id', 'patient_name', 'mrn',
        'patient_age', 'patient_gender', 'referred_by',
        'source_department', 'ward', 'bed', 'visit_number', 'diagnosis',
        'collection_date', 'report_date', 'report_type', 'status',
        'test_results', 'pathologist_comments',
        'performed_by', 'verified_by', 'verifier_title', 'verifier_qualifications',
        'priority', 'critical_flag', 'delivery_status',
        'email_sent_at', 'sms_sent_at', 'whatsapp_sent_at',
        'collected_at', 'printed_at', 'qr_code',
        'retention_years', 'is_archived',
    ];

    protected $casts = [
        'test_results' => 'array',
        'delivery_status' => 'array',
        'critical_flag' => 'boolean',
        'is_archived' => 'boolean',
        'collection_date' => 'datetime',
        'report_date' => 'datetime',
        'email_sent_at' => 'datetime',
        'sms_sent_at' => 'datetime',
        'whatsapp_sent_at' => 'datetime',
        'collected_at' => 'datetime',
        'printed_at' => 'datetime',
    ];

    public function labOrder()
    {
        return $this->belongsTo(LabOrder::class, 'lab_order_id', 'order_id');
    }
}
