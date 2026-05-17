<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Floor;
use App\Models\Ward;
use App\Models\Bed;
use App\Models\OpdVisit;
use App\Models\OpdBill;
use App\Models\EmergencyVisit;
use App\Models\EmergencyBill;
use App\Models\DoctorFee;
use App\Models\IpdAdmission;
use App\Models\HospitalInfo;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name'     => 'Super Admin',
            'email'    => 'Superadmin@healthops.com',
            'password' => bcrypt('Superadmin@54321'),
            'role'     => 'superadmin',
            'is_active' => true,
        ]);

        HospitalInfo::create([
            'name' => 'Nova Medical Complex',
            'short_name' => 'Nova HMS',
            'logo' => '',
            'registration_number' => 'HMC-2023-991',
            'ntn' => 'NTN-421-11-2',
            'health_authority_reg' => 'SHA-ISL-0112',
            'primary_phone' => '+92-51-111-NOVA',
            'secondary_phone' => '+92-51-222-HMS',
            'email' => 'admin@novahms.com',
            'website' => 'www.novahms.com',
            'address' => '123 Medical Complex, Sector H-8',
            'city' => 'Islamabad',
            'province' => 'Capital Territory',
            'country' => 'Pakistan',
            'postal_code' => '44000',
            'invoice_header' => 'HEALTHCARE REVOLUTIONIZED',
            'invoice_footer' => 'Please visit our pharmacy for original medicines. This is a computer generated slip.',
            'currency' => 'PKR',
            'tax_percentage' => 0,
            'invoice_prefix' => 'INV-',
        ]);

        $patients = [
            ['mrn' => 'MRN-2026-0001', 'name' => 'Ahmed Ali', 'age' => 45, 'gender' => 'Male', 'phone' => '0321-1234567', 'cnic' => '42101-1234567-1', 'visit_count' => 1, 'is_locked' => false, 'blood_group' => 'A+', 'address' => '123 Maple Street, Islamabad', 'first_visit_date' => '2026-01-10 09:00:00', 'last_visit_date' => now(), 'allergies' => ['Penicillin'], 'contact_type' => 'SELF', 'relationship_to_patient' => 'Self', 'status' => 'ACTIVE'],
            ['mrn' => 'MRN-2026-0002', 'name' => 'Sara Khan', 'age' => 32, 'gender' => 'Female', 'phone' => '0333-2345678', 'cnic' => '42101-1234567-2', 'visit_count' => 2, 'is_locked' => false, 'blood_group' => 'O+', 'address' => '456 Oak Avenue, Rawalpindi', 'first_visit_date' => '2026-01-15 10:00:00', 'last_visit_date' => now(), 'allergies' => [], 'contact_type' => 'SELF', 'relationship_to_patient' => 'Self', 'status' => 'ACTIVE'],
            ['mrn' => 'MRN-2026-0003', 'name' => 'Usman Ali', 'age' => 28, 'gender' => 'Male', 'phone' => '0300-3456789', 'cnic' => '42101-1234567-3', 'visit_count' => 1, 'is_locked' => false, 'blood_group' => 'B-', 'address' => '789 Pine Road, Lahore', 'first_visit_date' => '2026-01-20 14:30:00', 'last_visit_date' => now(), 'allergies' => ['Sulfa Drugs'], 'contact_type' => 'SELF', 'relationship_to_patient' => 'Self', 'status' => 'ACTIVE'],
            ['mrn' => 'MRN-2026-0004', 'name' => 'Fatima Bibi', 'age' => 60, 'gender' => 'Female', 'phone' => '0312-4567890', 'cnic' => '42101-1234567-4', 'visit_count' => 3, 'is_locked' => false, 'blood_group' => 'AB+', 'address' => '101 Cedar Lane, Karachi', 'first_visit_date' => '2026-01-05 08:15:00', 'last_visit_date' => now(), 'allergies' => [], 'contact_type' => 'SELF', 'relationship_to_patient' => 'Self', 'status' => 'ACTIVE'],
            ['mrn' => 'MRN-2026-0005', 'name' => 'Bilal Ahmed', 'age' => 50, 'gender' => 'Male', 'phone' => '0345-5678901', 'cnic' => '42101-1234567-5', 'visit_count' => 1, 'is_locked' => false, 'blood_group' => 'O-', 'address' => '202 Birch Blvd, Peshawar', 'first_visit_date' => '2026-02-01 11:45:00', 'last_visit_date' => now(), 'allergies' => ['Latex'], 'contact_type' => 'SELF', 'relationship_to_patient' => 'Self', 'status' => 'ACTIVE'],
            ['mrn' => 'MRN-2026-0006', 'name' => 'Sara Ali', 'age' => 5, 'gender' => 'Female', 'phone' => '0321-1234567', 'cnic' => '', 'visit_count' => 1, 'is_locked' => false, 'blood_group' => 'A+', 'address' => '123 Maple Street, Islamabad', 'first_visit_date' => '2026-02-15 09:00:00', 'last_visit_date' => now(), 'allergies' => [], 'contact_type' => 'GUARDIAN', 'guardian_name' => 'Ahmed Ali', 'guardian_phone' => '0321-1234567', 'guardian_cnic' => '42101-1234567-1', 'relationship_to_patient' => 'Daughter', 'status' => 'ACTIVE'],
            ['mrn' => 'MRN-2026-0007', 'name' => 'Hassan Ali', 'age' => 8, 'gender' => 'Male', 'phone' => '0321-1234567', 'cnic' => '', 'visit_count' => 0, 'is_locked' => false, 'blood_group' => 'B+', 'address' => '123 Maple Street, Islamabad', 'first_visit_date' => '2026-02-15 09:30:00', 'last_visit_date' => now(), 'allergies' => [], 'contact_type' => 'GUARDIAN', 'guardian_name' => 'Ahmed Ali', 'guardian_phone' => '0321-1234567', 'guardian_cnic' => '42101-1234567-1', 'relationship_to_patient' => 'Son', 'status' => 'ACTIVE'],
        ];
        foreach ($patients as $p) {
            Patient::create($p);
        }

        $doctors = [
            ['doctor_id' => 'DOC-1', 'employee_id' => 'EMP-101', 'role' => 'Doctor', 'designation' => 'Senior Cardiologist', 'department' => 'Cardiology', 'specialist' => 'Cardiologist', 'first_name' => 'Ayesha', 'last_name' => 'Siddiqui', 'father_name' => 'Tariq Siddiqui', 'mother_name' => 'Nadia Siddiqui', 'gender' => 'Female', 'marital_status' => 'Single', 'blood_group' => 'A+', 'dob' => '1985-05-15', 'phone' => '0311-9001001', 'email' => 'ayesha.siddiqui@novahms.com', 'emergency_contact' => '0311-9999999', 'cnic' => '42101-1111111-1', 'current_address' => '123 Cardiac Ave, Islamabad', 'permanent_address' => '123 Cardiac Ave, Islamabad', 'qualification' => 'MD Cardiology, AKUH', 'work_experience' => '12 Years', 'specialization' => 'Interventional Cardiology', 'notes' => 'Primary cardiologist for emergency cardiac care.', 'basic_salary' => 500000, 'contract_type' => 'Permanent', 'work_shift' => 'Morning', 'work_location' => 'Main Wing', 'bank_account_number' => '1234567890', 'bank_name' => 'HBL', 'bank_branch_name' => 'F-8 Branch', 'joining_date' => '2020-01-01', 'duty_from' => '09:00', 'duty_to' => '17:00', 'duty_days' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], 'status' => 'ACTIVE'],
            ['doctor_id' => 'DOC-2', 'employee_id' => 'EMP-102', 'role' => 'Doctor', 'designation' => 'General Physician', 'department' => 'General Medicine', 'specialist' => 'General Physician', 'first_name' => 'Imran', 'last_name' => 'Khan', 'father_name' => 'Rashid Khan', 'mother_name' => 'Salma Khan', 'gender' => 'Male', 'marital_status' => 'Married', 'blood_group' => 'B+', 'dob' => '1980-08-20', 'phone' => '0333-9002002', 'email' => 'imran.khan@novahms.com', 'emergency_contact' => '0333-9998998', 'cnic' => '42101-2222222-2', 'current_address' => '456 Med Lane, Rawalpindi', 'permanent_address' => '456 Med Lane, Rawalpindi', 'qualification' => 'MBBS, FCPS Medicine', 'work_experience' => '15 Years', 'specialization' => 'Internal Medicine', 'notes' => 'Senior Consultant.', 'basic_salary' => 450000, 'contract_type' => 'Permanent', 'work_shift' => 'Morning', 'work_location' => 'OPD Wing', 'bank_account_number' => '0987654321', 'bank_name' => 'Allied Bank', 'bank_branch_name' => 'Blue Area Branch', 'joining_date' => '2019-06-01', 'duty_from' => '09:00', 'duty_to' => '17:00', 'duty_days' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], 'status' => 'ACTIVE'],
            ['doctor_id' => 'DOC-3', 'employee_id' => 'EMP-103', 'role' => 'Doctor', 'designation' => 'Orthopedic Surgeon', 'department' => 'Orthopedics', 'specialist' => 'Orthopedic Surgeon', 'first_name' => 'Zainab', 'last_name' => 'Malik', 'father_name' => 'Asif Malik', 'mother_name' => 'Lubna Malik', 'gender' => 'Female', 'marital_status' => 'Married', 'blood_group' => 'O+', 'dob' => '1982-11-10', 'phone' => '0300-9003003', 'email' => 'zainab.malik@novahms.com', 'emergency_contact' => '0300-9997997', 'cnic' => '42101-3333333-3', 'current_address' => '789 Bone St, Islamabad', 'permanent_address' => '789 Bone St, Islamabad', 'qualification' => 'MBBS, FRCS Ortho', 'work_experience' => '10 Years', 'specialization' => 'Joint Replacement', 'notes' => 'Available for surgeries on Tue/Thu.', 'basic_salary' => 550000, 'contract_type' => 'Permanent', 'work_shift' => 'Evening', 'work_location' => 'OT Complex', 'bank_account_number' => '1122334455', 'bank_name' => 'MCB', 'bank_branch_name' => 'I-8 Branch', 'joining_date' => '2021-03-15', 'duty_from' => '14:00', 'duty_to' => '20:00', 'duty_days' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], 'status' => 'ACTIVE'],
            ['doctor_id' => 'DOC-4', 'employee_id' => 'EMP-104', 'role' => 'Doctor', 'designation' => 'Emergency Physician', 'department' => 'Emergency', 'specialist' => 'Emergency Medicine', 'first_name' => 'Hassan', 'last_name' => 'Raza', 'father_name' => 'Ali Raza', 'mother_name' => 'Sobia Raza', 'gender' => 'Male', 'marital_status' => 'Married', 'blood_group' => 'AB+', 'dob' => '1983-03-22', 'phone' => '0321-9004004', 'email' => 'hassan.raza@novahms.com', 'emergency_contact' => '0321-9996996', 'cnic' => '42101-4444444-4', 'current_address' => '12 ER Block, Islamabad', 'permanent_address' => '12 ER Block, Islamabad', 'qualification' => 'MBBS, FCPS Emergency Medicine', 'work_experience' => '8 Years', 'specialization' => 'Trauma & Critical Care', 'notes' => 'Lead ER physician, trauma specialist.', 'basic_salary' => 480000, 'contract_type' => 'Permanent', 'work_shift' => 'Rotating', 'work_location' => 'Emergency Wing', 'bank_account_number' => '5566778899', 'bank_name' => 'UBL', 'bank_branch_name' => 'G-9 Branch', 'joining_date' => '2020-06-01', 'duty_from' => '08:00', 'duty_to' => '20:00', 'duty_days' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], 'status' => 'ACTIVE'],
            ['doctor_id' => 'DOC-5', 'employee_id' => 'EMP-105', 'role' => 'Doctor', 'designation' => 'Emergency Medicine Specialist', 'department' => 'Emergency', 'specialist' => 'Emergency Medicine', 'first_name' => 'Nadia', 'last_name' => 'Hussain', 'father_name' => 'Kamran Hussain', 'mother_name' => 'Rubina Hussain', 'gender' => 'Female', 'marital_status' => 'Single', 'blood_group' => 'O-', 'dob' => '1988-07-14', 'phone' => '0345-9005005', 'email' => 'nadia.hussain@novahms.com', 'emergency_contact' => '0345-9995995', 'cnic' => '42101-5555555-5', 'current_address' => '78 Medical Colony, Rawalpindi', 'permanent_address' => '78 Medical Colony, Rawalpindi', 'qualification' => 'MBBS, MRCEM (UK)', 'work_experience' => '6 Years', 'specialization' => 'Acute Medicine & Resuscitation', 'notes' => 'Night shift ER physician, ACLS certified.', 'basic_salary' => 420000, 'contract_type' => 'Permanent', 'work_shift' => 'Night', 'work_location' => 'Emergency Wing', 'bank_account_number' => '6677889900', 'bank_name' => 'Meezan Bank', 'bank_branch_name' => 'Saddar Branch', 'joining_date' => '2022-01-15', 'duty_from' => '20:00', 'duty_to' => '08:00', 'duty_days' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], 'status' => 'ACTIVE'],
            ['doctor_id' => 'DOC-6', 'employee_id' => 'EMP-106', 'role' => 'Doctor', 'designation' => 'General Surgeon', 'department' => 'Surgery', 'specialist' => 'General Surgeon', 'first_name' => 'Tariq', 'last_name' => 'Mehmood', 'father_name' => 'Mehmood Ahmed', 'mother_name' => 'Nasreen Mehmood', 'gender' => 'Male', 'marital_status' => 'Married', 'blood_group' => 'B-', 'dob' => '1978-12-05', 'phone' => '0312-9006006', 'email' => 'tariq.mehmood@novahms.com', 'emergency_contact' => '0312-9994994', 'cnic' => '42101-6666666-6', 'current_address' => '45 Surgeons Lane, Islamabad', 'permanent_address' => '45 Surgeons Lane, Islamabad', 'qualification' => 'MBBS, FCPS Surgery', 'work_experience' => '18 Years', 'specialization' => 'Abdominal & Trauma Surgery', 'notes' => 'On-call surgeon for ER trauma cases.', 'basic_salary' => 600000, 'contract_type' => 'Permanent', 'work_shift' => 'Morning', 'work_location' => 'OT Complex', 'bank_account_number' => '7788990011', 'bank_name' => 'Faysal Bank', 'bank_branch_name' => 'F-10 Branch', 'joining_date' => '2018-09-01', 'duty_from' => '09:00', 'duty_to' => '17:00', 'duty_days' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], 'status' => 'ACTIVE'],
        ];
        foreach ($doctors as $d) {
            Doctor::create($d);
        }

        DoctorFee::create(['fee_id' => 'FEE-1', 'doctor_id' => 'DOC-1', 'doctor_name' => 'Ayesha Siddiqui', 'service_type' => 'OPD', 'procedure' => 'Consultation', 'fee' => 3000]);
        DoctorFee::create(['fee_id' => 'FEE-2', 'doctor_id' => 'DOC-2', 'doctor_name' => 'Imran Khan', 'service_type' => 'OPD', 'procedure' => 'Consultation', 'fee' => 2500]);
        DoctorFee::create(['fee_id' => 'FEE-3', 'doctor_id' => 'DOC-3', 'doctor_name' => 'Zainab Malik', 'service_type' => 'OPD', 'procedure' => 'Consultation', 'fee' => 3500]);
        DoctorFee::create(['fee_id' => 'FEE-4', 'doctor_id' => 'DOC-4', 'doctor_name' => 'Hassan Raza', 'service_type' => 'ER', 'procedure' => 'ER Consultation', 'fee' => 4000]);
        DoctorFee::create(['fee_id' => 'FEE-5', 'doctor_id' => 'DOC-5', 'doctor_name' => 'Nadia Hussain', 'service_type' => 'ER', 'procedure' => 'ER Consultation', 'fee' => 3500]);
        DoctorFee::create(['fee_id' => 'FEE-6', 'doctor_id' => 'DOC-6', 'doctor_name' => 'Tariq Mehmood', 'service_type' => 'ER', 'procedure' => 'Surgical Consultation', 'fee' => 5000]);
        DoctorFee::create(['fee_id' => 'FEE-7', 'doctor_id' => 'DOC-6', 'doctor_name' => 'Tariq Mehmood', 'service_type' => 'OT', 'procedure' => 'Surgery', 'fee' => 25000]);
        DoctorFee::create(['fee_id' => 'FEE-8', 'doctor_id' => 'DOC-3', 'doctor_name' => 'Zainab Malik', 'service_type' => 'OT', 'procedure' => 'Surgery', 'fee' => 30000]);

        Floor::create(['floor_id' => 'FLR-1', 'name' => 'Ground Floor', 'code' => 'G']);
        Floor::create(['floor_id' => 'FLR-2', 'name' => 'First Floor', 'code' => '1']);

        Ward::create(['ward_id' => 'WRD-1', 'name' => 'Emergency Observation', 'category' => 'Emergency', 'floor_id' => 'FLR-1']);
        Ward::create(['ward_id' => 'WRD-2', 'name' => 'General Ward A', 'category' => 'General', 'floor_id' => 'FLR-2']);
        Ward::create(['ward_id' => 'WRD-3', 'name' => 'Intensive Care Unit (ICU)', 'category' => 'ICU', 'floor_id' => 'FLR-2']);

        Bed::create(['bed_id' => 'BED-1', 'bed_number' => 'G-101', 'type' => 'General', 'ward_id' => 'WRD-1', 'floor_id' => 'FLR-1', 'status' => 'Occupied', 'assigned_patient_name' => 'Ahmed Ali', 'assigned_patient_mrn' => 'MRN-2026-0001']);
        Bed::create(['bed_id' => 'BED-2', 'bed_number' => 'G-102', 'type' => 'General', 'ward_id' => 'WRD-1', 'floor_id' => 'FLR-1', 'status' => 'Available']);

        $yesterday = Carbon::now()->subDay();
        $now = Carbon::now();
        $oneHourAgo = Carbon::now()->subHour();

        OpdVisit::create(['visit_id' => 'MRN-2026-0001-1', 'visit_number' => 1, 'mrn' => 'MRN-2026-0001', 'patient_name' => 'Ahmed Ali', 'doctor_name' => 'Ayesha Siddiqui', 'department' => 'Cardiology', 'visit_type' => 'New Consultation', 'referred_by' => 'Self', 'consultation_date' => $yesterday, 'status' => 'Completed', 'payment_status' => 'Paid']);
        OpdVisit::create(['visit_id' => 'MRN-2026-0002-2', 'visit_number' => 2, 'mrn' => 'MRN-2026-0002', 'patient_name' => 'Sara Khan', 'doctor_name' => 'Imran Khan', 'department' => 'General Medicine', 'visit_type' => 'Follow-up', 'referred_by' => 'Dr. Smith', 'consultation_date' => $now, 'status' => 'Active', 'payment_status' => 'Pending']);
        OpdVisit::create(['visit_id' => 'MRN-2026-0003-1', 'visit_number' => 1, 'mrn' => 'MRN-2026-0003', 'patient_name' => 'Usman Ali', 'doctor_name' => 'Zainab Malik', 'department' => 'Orthopedics', 'visit_type' => 'New Consultation', 'referred_by' => 'Self', 'consultation_date' => $now, 'status' => 'Active', 'payment_status' => 'Paid']);
        OpdVisit::create(['visit_id' => 'MRN-2026-0004-3', 'visit_number' => 3, 'mrn' => 'MRN-2026-0004', 'patient_name' => 'Fatima Bibi', 'doctor_name' => 'Imran Khan', 'department' => 'General Medicine', 'visit_type' => 'New Consultation', 'referred_by' => 'Self', 'consultation_date' => $oneHourAgo, 'status' => 'Active', 'payment_status' => 'Paid']);
        OpdVisit::create(['visit_id' => 'MRN-2026-0006-1', 'visit_number' => 1, 'mrn' => 'MRN-2026-0006', 'patient_name' => 'Sara Ali', 'doctor_name' => 'Imran Khan', 'department' => 'General Medicine', 'visit_type' => 'New Consultation', 'referred_by' => 'Self', 'consultation_date' => $now, 'status' => 'Active', 'payment_status' => 'Pending']);

        OpdBill::create(['bill_id' => 'BILL-5001', 'mrn' => 'MRN-2026-0001', 'visit_id' => 'MRN-2026-0001-1', 'patient_name' => 'Ahmed Ali', 'consultation_charges' => 500, 'doctor_fee' => 1500, 'total_amount' => 2000, 'payment_status' => 'Paid', 'history' => []]);
        OpdBill::create(['bill_id' => 'BILL-5002', 'mrn' => 'MRN-2026-0002', 'visit_id' => 'MRN-2026-0002-2', 'patient_name' => 'Sara Khan', 'consultation_charges' => 300, 'doctor_fee' => 1000, 'total_amount' => 1300, 'payment_status' => 'Pending', 'history' => []]);
        OpdBill::create(['bill_id' => 'BILL-5003', 'mrn' => 'MRN-2026-0003', 'visit_id' => 'MRN-2026-0003-1', 'patient_name' => 'Usman Ali', 'consultation_charges' => 500, 'doctor_fee' => 2000, 'total_amount' => 2500, 'payment_status' => 'Paid', 'history' => []]);
        OpdBill::create(['bill_id' => 'BILL-5004', 'mrn' => 'MRN-2026-0004', 'visit_id' => 'MRN-2026-0004-3', 'patient_name' => 'Fatima Bibi', 'consultation_charges' => 300, 'doctor_fee' => 1000, 'total_amount' => 1300, 'payment_status' => 'Paid', 'history' => []]);
        OpdBill::create(['bill_id' => 'BILL-5005', 'mrn' => 'MRN-2026-0006', 'visit_id' => 'MRN-2026-0006-1', 'patient_name' => 'Sara Ali', 'consultation_charges' => 300, 'doctor_fee' => 800, 'total_amount' => 1100, 'payment_status' => 'Pending', 'history' => []]);

        $thirtyMinsAgo = Carbon::now()->subMinutes(30);
        $twoHoursAgo = Carbon::now()->subHours(2);
        $threeHoursAgo = Carbon::now()->subHours(3);

        EmergencyVisit::create(['visit_id' => 'MRN-2026-0001-ER-1', 'visit_number' => 1, 'mrn' => 'MRN-2026-0001', 'patient_name' => 'Ahmed Ali', 'doctor_name' => 'Ayesha Siddiqui', 'department' => 'Emergency', 'visit_type' => 'ER Visit', 'consultation_date' => $now, 'status' => 'Active', 'payment_status' => 'Pending', 'esi' => '3 - Urgent', 'mode_of_arrival' => 'Walk-in', 'triage_category' => 'Yellow', 'chief_complaint' => 'Chest Pain, radiating to left arm', 'clinical_status' => 'In Treatment', 'vitals' => ['bp' => '145/95', 'hr' => '98', 'rr' => '22', 'spo2' => '96%', 'temp' => '98.6', 'pain' => 6]]);
        EmergencyVisit::create(['visit_id' => 'MRN-2026-0002-ER-1', 'visit_number' => 1, 'mrn' => 'MRN-2026-0002', 'patient_name' => 'Sara Khan', 'doctor_name' => 'Imran Khan', 'department' => 'Emergency', 'visit_type' => 'ER Visit', 'consultation_date' => $thirtyMinsAgo, 'status' => 'Active', 'payment_status' => 'Paid', 'esi' => '4 - Less Urgent', 'mode_of_arrival' => 'Walk-in', 'triage_category' => 'Green', 'chief_complaint' => 'Minor laceration on finger', 'clinical_status' => 'Waiting', 'vitals' => ['bp' => '120/80', 'hr' => '72', 'rr' => '16', 'spo2' => '99%', 'temp' => '98.4', 'pain' => 2]]);
        EmergencyVisit::create(['visit_id' => 'MRN-2026-0003-ER-1', 'visit_number' => 1, 'mrn' => 'MRN-2026-0003', 'patient_name' => 'Usman Ali', 'doctor_name' => 'Zainab Malik', 'department' => 'Emergency', 'visit_type' => 'Trauma', 'consultation_date' => $oneHourAgo, 'status' => 'Active', 'payment_status' => 'Pending', 'esi' => '1 - Resuscitation', 'mode_of_arrival' => 'Ambulance', 'triage_category' => 'Red', 'chief_complaint' => 'Severe head trauma, unconscious', 'clinical_status' => 'In Treatment', 'vitals' => ['bp' => '90/60', 'hr' => '120', 'rr' => '28', 'spo2' => '88%', 'temp' => '97.0', 'gcs' => '8/15']]);
        EmergencyVisit::create(['visit_id' => 'MRN-2026-0004-ER-1', 'visit_number' => 1, 'mrn' => 'MRN-2026-0004', 'patient_name' => 'Fatima Bibi', 'doctor_name' => 'Imran Khan', 'department' => 'Emergency', 'visit_type' => 'ER Visit', 'consultation_date' => $twoHoursAgo, 'status' => 'Active', 'payment_status' => 'Paid', 'esi' => '2 - Emergent', 'mode_of_arrival' => 'Walk-in', 'triage_category' => 'Orange', 'chief_complaint' => 'High fever, confusion', 'clinical_status' => 'Under Observation', 'vitals' => ['bp' => '110/70', 'hr' => '105', 'rr' => '20', 'spo2' => '95%', 'temp' => '103.5', 'pain' => 4]]);
        EmergencyVisit::create(['visit_id' => 'MRN-2026-0005-ER-1', 'visit_number' => 1, 'mrn' => 'MRN-2026-0005', 'patient_name' => 'Bilal Ahmed', 'doctor_name' => 'Ayesha Siddiqui', 'department' => 'Emergency', 'visit_type' => 'ER Visit', 'consultation_date' => $threeHoursAgo, 'status' => 'Active', 'payment_status' => 'Paid', 'esi' => '5 - Non Urgent', 'mode_of_arrival' => 'Walk-in', 'triage_category' => 'Green', 'chief_complaint' => 'Sprained ankle', 'clinical_status' => 'Ready for Disposition', 'vitals' => ['bp' => '130/85', 'hr' => '80', 'rr' => '18', 'spo2' => '98%', 'temp' => '98.2', 'pain' => 3]]);

        EmergencyBill::create(['bill_id' => 'ER-BILL-9001', 'mrn' => 'MRN-2026-0001', 'visit_id' => 'MRN-2026-0001-ER-1', 'patient_name' => 'Ahmed Ali', 'consultation_charges' => 1000, 'doctor_fee' => 4000, 'total_amount' => 5000, 'payment_status' => 'Pending', 'history' => []]);
        EmergencyBill::create(['bill_id' => 'ER-BILL-9002', 'mrn' => 'MRN-2026-0002', 'visit_id' => 'MRN-2026-0002-ER-1', 'patient_name' => 'Sara Khan', 'consultation_charges' => 500, 'doctor_fee' => 2500, 'total_amount' => 3000, 'payment_status' => 'Paid', 'history' => []]);
        EmergencyBill::create(['bill_id' => 'ER-BILL-9003', 'mrn' => 'MRN-2026-0003', 'visit_id' => 'MRN-2026-0003-ER-1', 'patient_name' => 'Usman Ali', 'consultation_charges' => 5000, 'doctor_fee' => 10000, 'total_amount' => 15000, 'payment_status' => 'Pending', 'history' => []]);
        EmergencyBill::create(['bill_id' => 'ER-BILL-9004', 'mrn' => 'MRN-2026-0004', 'visit_id' => 'MRN-2026-0004-ER-1', 'patient_name' => 'Fatima Bibi', 'consultation_charges' => 2000, 'doctor_fee' => 6000, 'total_amount' => 8000, 'payment_status' => 'Paid', 'history' => []]);
        EmergencyBill::create(['bill_id' => 'ER-BILL-9005', 'mrn' => 'MRN-2026-0005', 'visit_id' => 'MRN-2026-0005-ER-1', 'patient_name' => 'Bilal Ahmed', 'consultation_charges' => 1000, 'doctor_fee' => 3000, 'total_amount' => 4000, 'payment_status' => 'Paid', 'history' => []]);

        IpdAdmission::create(['admission_id' => 'MRN-2026-0001-IPD-1', 'admission_number' => 1, 'mrn' => 'MRN-2026-0001', 'patient_name' => 'Ahmed Ali', 'doctor_name' => 'Ayesha Siddiqui', 'department' => 'Cardiology', 'admission_date' => '2026-02-12', 'admission_source' => 'Outpatient', 'status' => 'Active', 'payment_status' => 'Paid', 'admission_type' => 'Routine', 'initial_diagnosis' => 'Angina', 'estimated_stay' => '5 Days', 'ward' => 'General Ward A', 'floor_room' => 'FLR-2', 'bed' => 'G-101']);
        IpdAdmission::create(['admission_id' => 'MRN-2026-0003-IPD-1', 'admission_number' => 1, 'mrn' => 'MRN-2026-0003', 'patient_name' => 'Usman Ali', 'doctor_name' => 'Hassan Raza', 'department' => 'Emergency', 'admission_date' => '2026-02-14', 'admission_source' => 'Emergency', 'status' => 'Active', 'payment_status' => 'Pending', 'admission_type' => 'Emergency', 'initial_diagnosis' => 'Severe head trauma', 'estimated_stay' => '10 Days', 'ward' => 'Intensive Care Unit (ICU)', 'floor_room' => 'FLR-2', 'bed' => 'B-106']);

        $this->call(\Database\Seeders\FormBuilderSeeder::class);
    }
}
