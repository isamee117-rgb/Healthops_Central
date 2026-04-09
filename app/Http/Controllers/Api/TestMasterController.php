<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LabTest;
use App\Models\LabTestPackage;
use App\Traits\HmsHelpers;
use Illuminate\Http\Request;

class TestMasterController extends Controller
{
    use HmsHelpers;

    public function stats()
    {
        $this->seedIfEmpty();
        $totalTests = LabTest::count();
        $activeTests = LabTest::where('status', 'Active')->count();
        $packages = LabTestPackage::count();
        $departments = LabTest::distinct('department')->count('department');
        $avgPrice = round(LabTest::where('status', 'Active')->avg('standard_price') ?? 0, 0);

        return response()->json([
            'totalTests'  => $totalTests,
            'activeTests' => $activeTests,
            'packages'    => $packages,
            'departments' => $departments,
            'avgPrice'    => $avgPrice,
        ]);
    }

    public function index(Request $request)
    {
        $query = LabTest::query();

        if ($request->filled('search')) {
            $s = '%' . $request->search . '%';
            $query->where(function ($q) use ($s) {
                $q->where('test_code', 'LIKE', $s)
                  ->orWhere('test_name', 'LIKE', $s)
                  ->orWhere('short_name', 'LIKE', $s)
                  ->orWhere('alt_names', 'LIKE', $s);
            });
        }
        if ($request->filled('department')) {
            $query->where('department', $request->department);
        }
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }
        if ($request->filled('sample_type')) {
            $query->where('sample_type', $request->sample_type);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('fasting')) {
            $query->where('fasting_required', $request->fasting);
        }

        $sort = $request->input('sort', 'test_code');
        $dir  = $request->input('dir', 'asc');
        $query->orderBy($sort, $dir);

        $tests = $query->get()->map(function ($t) {
            $comps = is_array($t->components) ? count($t->components) : 0;
            return [
                'testCode'       => $t->test_code,
                'testName'       => $t->test_name,
                'shortName'      => $t->short_name,
                'department'     => $t->department,
                'category'       => $t->category,
                'sampleType'     => $t->sample_type,
                'sampleVolume'   => $t->sample_volume,
                'fastingRequired'=> $t->fasting_required,
                'standardTat'    => $t->standard_tat,
                'components'     => $comps,
                'standardPrice'  => round($t->standard_price, 2),
                'status'         => $t->status,
                'orderCount'     => $t->order_count,
            ];
        });

        return response()->json(['tests' => $tests]);
    }

    public function show($testCode)
    {
        $t = LabTest::where('test_code', $testCode)->first();
        if (!$t) return response()->json(['error' => 'Test not found'], 404);
        return response()->json($t);
    }

    public function store(Request $request)
    {
        $request->validate([
            'test_name'  => 'required|string|max:255',
            'short_name' => 'required|string|max:30',
            'department' => 'required|string',
            'category'   => 'required|string',
            'sample_type'=> 'required|string',
            'standard_price' => 'required|numeric|min:0',
        ]);

        $lastCode = LabTest::orderByRaw("CAST(SUBSTRING(test_code FROM 6) AS UNSIGNED) DESC")->first();
        $nextNum = $lastCode ? (intval(substr($lastCode->test_code, 5)) + 1) : 1;
        $testCode = sprintf('TEST-%03d', $nextNum);

        $data = $request->all();
        $data['test_code'] = $testCode;
        if (isset($data['components']) && is_array($data['components']) && count($data['components']) > 0) {
            $data['has_components'] = true;
        }

        $test = LabTest::create($data);

        return response()->json([
            'message'  => 'Test created successfully',
            'testCode' => $test->test_code,
            'testName' => $test->test_name,
        ], 201);
    }

    public function update(Request $request, $testCode)
    {
        $test = LabTest::where('test_code', $testCode)->first();
        if (!$test) return response()->json(['error' => 'Test not found'], 404);

        $data = $request->all();
        if (isset($data['components']) && is_array($data['components'])) {
            $data['has_components'] = count($data['components']) > 0;
        }

        $test->update($data);

        return response()->json(['message' => 'Test updated successfully']);
    }

    public function toggleStatus($testCode)
    {
        $test = LabTest::where('test_code', $testCode)->first();
        if (!$test) return response()->json(['error' => 'Test not found'], 404);

        $test->status = $test->status === 'Active' ? 'Inactive' : 'Active';
        $test->save();

        return response()->json(['message' => 'Status updated', 'status' => $test->status]);
    }

    public function duplicate($testCode)
    {
        $test = LabTest::where('test_code', $testCode)->first();
        if (!$test) return response()->json(['error' => 'Test not found'], 404);

        $lastCode = LabTest::orderByRaw("CAST(SUBSTRING(test_code FROM 6) AS UNSIGNED) DESC")->first();
        $nextNum = intval(substr($lastCode->test_code, 5)) + 1;
        $newCode = sprintf('TEST-%03d', $nextNum);

        $newData = $test->toArray();
        $newData['test_code'] = $newCode;
        $newData['test_name'] = $test->test_name . ' (Copy)';
        unset($newData['created_at'], $newData['updated_at']);

        LabTest::create($newData);

        return response()->json(['message' => 'Test duplicated', 'testCode' => $newCode]);
    }

    public function packages(Request $request)
    {
        $query = LabTestPackage::query();

        if ($request->filled('search')) {
            $s = '%' . $request->search . '%';
            $query->where(function ($q) use ($s) {
                $q->where('package_code', 'LIKE', $s)
                  ->orWhere('package_name', 'LIKE', $s);
            });
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $pkgs = $query->orderBy('package_code')->get()->map(function ($p) {
            $tests = is_array($p->tests) ? $p->tests : [];
            $depts = is_array($p->departments) ? $p->departments : [];
            $samples = is_array($p->sample_summary) ? $p->sample_summary : [];
            return [
                'packageCode'     => $p->package_code,
                'packageName'     => $p->package_name,
                'testsCount'      => count($tests),
                'departments'     => $depts,
                'individualTotal' => round($p->individual_total, 2),
                'packagePrice'    => round($p->package_price, 2),
                'discountPercent' => round($p->discount_percent, 0),
                'sampleTypes'     => array_column($samples, 'type'),
                'maxTat'          => $p->max_tat,
                'status'          => $p->status,
                'orderCount'      => $p->order_count,
            ];
        });

        return response()->json(['packages' => $pkgs]);
    }

    public function showPackage($packageCode)
    {
        $p = LabTestPackage::where('package_code', $packageCode)->first();
        if (!$p) return response()->json(['error' => 'Package not found'], 404);
        return response()->json($p);
    }

    public function storePackage(Request $request)
    {
        $request->validate([
            'package_name'  => 'required|string|max:255',
            'package_price' => 'required|numeric|min:0',
            'tests'         => 'required|array|min:1',
        ]);

        $lastCode = LabTestPackage::orderByRaw("CAST(SUBSTRING(package_code FROM 5) AS UNSIGNED) DESC")->first();
        $nextNum = $lastCode ? (intval(substr($lastCode->package_code, 4)) + 1) : 1;
        $pkgCode = sprintf('PKG-%03d', $nextNum);

        $testCodes = $request->input('tests', []);
        $testsData = LabTest::whereIn('test_code', array_column($testCodes, 'testCode'))->get();
        $individualTotal = $testsData->sum('standard_price');
        $packagePrice = $request->input('package_price', $individualTotal);
        $discount = $individualTotal > 0 ? round((($individualTotal - $packagePrice) / $individualTotal) * 100, 1) : 0;

        $departments = $testsData->pluck('department')->unique()->values()->all();
        $sampleSummary = $testsData->groupBy('sample_type')->map(function ($g, $type) {
            return ['type' => $type, 'volume' => $g->first()->sample_volume];
        })->values()->all();
        $fasting = $testsData->contains(function ($t) { return $t->fasting_required === 'Yes'; });
        $maxTat = $testsData->max('standard_tat');

        $data = $request->all();
        $data['package_code'] = $pkgCode;
        $data['individual_total'] = $individualTotal;
        $data['discount_percent'] = $discount;
        $data['departments'] = $departments;
        $data['sample_summary'] = $sampleSummary;
        $data['fasting_required'] = $fasting;
        $data['max_tat'] = $maxTat;

        LabTestPackage::create($data);

        return response()->json([
            'message'     => 'Package created successfully',
            'packageCode' => $pkgCode,
        ], 201);
    }

    public function updatePackage(Request $request, $packageCode)
    {
        $pkg = LabTestPackage::where('package_code', $packageCode)->first();
        if (!$pkg) return response()->json(['error' => 'Package not found'], 404);

        $pkg->update($request->all());

        return response()->json(['message' => 'Package updated successfully']);
    }

    public function testSearch(Request $request)
    {
        $s = '%' . ($request->input('q', '')) . '%';
        $tests = LabTest::where('status', 'Active')
            ->where(function ($q) use ($s) {
                $q->where('test_name', 'LIKE', $s)
                  ->orWhere('test_code', 'LIKE', $s)
                  ->orWhere('short_name', 'LIKE', $s);
            })
            ->limit(20)
            ->get(['test_code', 'test_name', 'short_name', 'department', 'sample_type', 'standard_price', 'standard_tat']);

        return response()->json($tests);
    }

    private function seedIfEmpty()
    {
        if (LabTest::count() > 0) return;

        $tests = [
            ['TEST-001', 'Complete Blood Count', 'CBC', 'Hematology', 'Routine', 'Blood - EDTA (Purple top)', '3-5 mL', 'EDTA tube', 'No', null, '2 hours', '1 hour', 800, 1300, true, [
                ['name' => 'Hemoglobin (Hb)', 'short' => 'Hb', 'unit' => 'g/dL', 'rangeMale' => '13-17', 'rangeFemale' => '12-15', 'rangeChild' => '11-14', 'criticalLow' => '< 7', 'criticalHigh' => '> 20'],
                ['name' => 'WBC Count', 'short' => 'WBC', 'unit' => '/µL', 'rangeMale' => '4000-11000', 'rangeFemale' => '4000-11000', 'rangeChild' => '5000-13000', 'criticalLow' => '< 2000', 'criticalHigh' => '> 30000'],
                ['name' => 'RBC Count', 'short' => 'RBC', 'unit' => 'million/µL', 'rangeMale' => '4.5-5.5', 'rangeFemale' => '4.0-5.0', 'rangeChild' => '3.8-5.5', 'criticalLow' => '< 2.0', 'criticalHigh' => '> 7.0'],
                ['name' => 'Hematocrit', 'short' => 'HCT', 'unit' => '%', 'rangeMale' => '40-54', 'rangeFemale' => '36-48', 'rangeChild' => '35-45', 'criticalLow' => '< 20', 'criticalHigh' => '> 60'],
                ['name' => 'Platelet Count', 'short' => 'PLT', 'unit' => '/µL', 'rangeMale' => '150000-400000', 'rangeFemale' => '150000-400000', 'rangeChild' => '150000-450000', 'criticalLow' => '< 50000', 'criticalHigh' => '> 1000000'],
                ['name' => 'MCV', 'short' => 'MCV', 'unit' => 'fL', 'rangeMale' => '80-100', 'rangeFemale' => '80-100', 'rangeChild' => '75-95', 'criticalLow' => '', 'criticalHigh' => ''],
                ['name' => 'MCH', 'short' => 'MCH', 'unit' => 'pg', 'rangeMale' => '27-33', 'rangeFemale' => '27-33', 'rangeChild' => '25-33', 'criticalLow' => '', 'criticalHigh' => ''],
                ['name' => 'MCHC', 'short' => 'MCHC', 'unit' => 'g/dL', 'rangeMale' => '32-36', 'rangeFemale' => '32-36', 'rangeChild' => '32-36', 'criticalLow' => '', 'criticalHigh' => ''],
                ['name' => 'Neutrophils', 'short' => 'NEUT', 'unit' => '%', 'rangeMale' => '40-70', 'rangeFemale' => '40-70', 'rangeChild' => '30-60', 'criticalLow' => '', 'criticalHigh' => ''],
                ['name' => 'Lymphocytes', 'short' => 'LYMPH', 'unit' => '%', 'rangeMale' => '20-40', 'rangeFemale' => '20-40', 'rangeChild' => '25-50', 'criticalLow' => '', 'criticalHigh' => ''],
                ['name' => 'Monocytes', 'short' => 'MONO', 'unit' => '%', 'rangeMale' => '2-8', 'rangeFemale' => '2-8', 'rangeChild' => '2-10', 'criticalLow' => '', 'criticalHigh' => ''],
                ['name' => 'ESR', 'short' => 'ESR', 'unit' => 'mm/hr', 'rangeMale' => '0-15', 'rangeFemale' => '0-20', 'rangeChild' => '0-10', 'criticalLow' => '', 'criticalHigh' => '> 100'],
            ]],
            ['TEST-002', 'Blood Sugar Fasting', 'BSF', 'Clinical Chemistry', 'Routine', 'Blood - Fluoride (Gray top)', '2 mL', 'Fluoride tube', 'Yes', 12, '1 hour', '30 min', 300, 500, true, [
                ['name' => 'Blood Glucose Fasting', 'short' => 'BSF', 'unit' => 'mg/dL', 'rangeMale' => '70-100', 'rangeFemale' => '70-100', 'rangeChild' => '60-100', 'criticalLow' => '< 40', 'criticalHigh' => '> 400'],
            ]],
            ['TEST-003', 'Blood Sugar Random', 'BSR', 'Clinical Chemistry', 'Routine', 'Blood - Fluoride (Gray top)', '2 mL', 'Fluoride tube', 'No', null, '1 hour', '30 min', 300, 500, true, [
                ['name' => 'Blood Glucose Random', 'short' => 'BSR', 'unit' => 'mg/dL', 'rangeMale' => '70-140', 'rangeFemale' => '70-140', 'rangeChild' => '60-140', 'criticalLow' => '< 40', 'criticalHigh' => '> 500'],
            ]],
            ['TEST-004', 'HbA1c (Glycated Hemoglobin)', 'HbA1c', 'Clinical Chemistry', 'Specialized', 'Blood - EDTA (Purple top)', '3 mL', 'EDTA tube', 'No', null, '4 hours', '2 hours', 1500, 2000, true, [
                ['name' => 'HbA1c', 'short' => 'HbA1c', 'unit' => '%', 'rangeMale' => '4.0-5.6', 'rangeFemale' => '4.0-5.6', 'rangeChild' => '4.0-5.6', 'criticalLow' => '', 'criticalHigh' => '> 14'],
            ]],
            ['TEST-005', 'Lipid Profile', 'LIPID', 'Clinical Chemistry', 'Routine', 'Blood - Serum (Red top)', '5 mL', 'Plain tube', 'Yes', 12, '4 hours', '2 hours', 1200, 1700, true, [
                ['name' => 'Total Cholesterol', 'short' => 'TC', 'unit' => 'mg/dL', 'rangeMale' => '< 200', 'rangeFemale' => '< 200', 'rangeChild' => '< 170', 'criticalLow' => '', 'criticalHigh' => '> 300'],
                ['name' => 'HDL Cholesterol', 'short' => 'HDL', 'unit' => 'mg/dL', 'rangeMale' => '> 40', 'rangeFemale' => '> 50', 'rangeChild' => '> 35', 'criticalLow' => '< 20', 'criticalHigh' => ''],
                ['name' => 'LDL Cholesterol', 'short' => 'LDL', 'unit' => 'mg/dL', 'rangeMale' => '< 130', 'rangeFemale' => '< 130', 'rangeChild' => '< 110', 'criticalLow' => '', 'criticalHigh' => '> 190'],
                ['name' => 'Triglycerides', 'short' => 'TG', 'unit' => 'mg/dL', 'rangeMale' => '< 150', 'rangeFemale' => '< 150', 'rangeChild' => '< 130', 'criticalLow' => '', 'criticalHigh' => '> 500'],
                ['name' => 'VLDL Cholesterol', 'short' => 'VLDL', 'unit' => 'mg/dL', 'rangeMale' => '5-30', 'rangeFemale' => '5-30', 'rangeChild' => '5-25', 'criticalLow' => '', 'criticalHigh' => ''],
            ]],
            ['TEST-006', 'Liver Function Tests', 'LFT', 'Clinical Chemistry', 'Routine', 'Blood - Serum (Red top)', '5 mL', 'Plain tube', 'Yes', 8, '4 hours', '2 hours', 1500, 2000, true, [
                ['name' => 'Total Bilirubin', 'short' => 'T.Bil', 'unit' => 'mg/dL', 'rangeMale' => '0.1-1.2', 'rangeFemale' => '0.1-1.2', 'rangeChild' => '0.1-1.0', 'criticalLow' => '', 'criticalHigh' => '> 12'],
                ['name' => 'Direct Bilirubin', 'short' => 'D.Bil', 'unit' => 'mg/dL', 'rangeMale' => '0.0-0.3', 'rangeFemale' => '0.0-0.3', 'rangeChild' => '0.0-0.2', 'criticalLow' => '', 'criticalHigh' => ''],
                ['name' => 'ALT (SGPT)', 'short' => 'ALT', 'unit' => 'IU/L', 'rangeMale' => '7-56', 'rangeFemale' => '7-45', 'rangeChild' => '7-40', 'criticalLow' => '', 'criticalHigh' => '> 1000'],
                ['name' => 'AST (SGOT)', 'short' => 'AST', 'unit' => 'IU/L', 'rangeMale' => '10-40', 'rangeFemale' => '9-32', 'rangeChild' => '10-35', 'criticalLow' => '', 'criticalHigh' => '> 1000'],
                ['name' => 'Alkaline Phosphatase', 'short' => 'ALP', 'unit' => 'IU/L', 'rangeMale' => '44-147', 'rangeFemale' => '44-147', 'rangeChild' => '100-400', 'criticalLow' => '', 'criticalHigh' => ''],
                ['name' => 'Total Protein', 'short' => 'TP', 'unit' => 'g/dL', 'rangeMale' => '6.0-8.3', 'rangeFemale' => '6.0-8.3', 'rangeChild' => '6.0-8.0', 'criticalLow' => '< 4.0', 'criticalHigh' => ''],
                ['name' => 'Albumin', 'short' => 'ALB', 'unit' => 'g/dL', 'rangeMale' => '3.5-5.5', 'rangeFemale' => '3.5-5.5', 'rangeChild' => '3.5-5.0', 'criticalLow' => '< 1.5', 'criticalHigh' => ''],
            ]],
            ['TEST-007', 'Kidney Function Tests', 'RFT', 'Clinical Chemistry', 'Routine', 'Blood - Serum (Red top)', '5 mL', 'Plain tube', 'No', null, '4 hours', '2 hours', 1200, 1700, true, [
                ['name' => 'Blood Urea', 'short' => 'Urea', 'unit' => 'mg/dL', 'rangeMale' => '17-43', 'rangeFemale' => '17-43', 'rangeChild' => '10-40', 'criticalLow' => '', 'criticalHigh' => '> 100'],
                ['name' => 'Serum Creatinine', 'short' => 'Cr', 'unit' => 'mg/dL', 'rangeMale' => '0.7-1.3', 'rangeFemale' => '0.6-1.1', 'rangeChild' => '0.3-0.7', 'criticalLow' => '', 'criticalHigh' => '> 10'],
                ['name' => 'Uric Acid', 'short' => 'UA', 'unit' => 'mg/dL', 'rangeMale' => '3.5-7.2', 'rangeFemale' => '2.6-6.0', 'rangeChild' => '2.0-5.5', 'criticalLow' => '', 'criticalHigh' => '> 12'],
                ['name' => 'Sodium', 'short' => 'Na', 'unit' => 'mEq/L', 'rangeMale' => '136-145', 'rangeFemale' => '136-145', 'rangeChild' => '136-145', 'criticalLow' => '< 120', 'criticalHigh' => '> 160'],
                ['name' => 'Potassium', 'short' => 'K', 'unit' => 'mEq/L', 'rangeMale' => '3.5-5.0', 'rangeFemale' => '3.5-5.0', 'rangeChild' => '3.5-5.5', 'criticalLow' => '< 2.5', 'criticalHigh' => '> 6.5'],
            ]],
            ['TEST-008', 'Thyroid Function Tests', 'TFT', 'Clinical Chemistry', 'Specialized', 'Blood - Serum (Red top)', '5 mL', 'Plain tube', 'No', null, '6 hours', '3 hours', 2500, 3500, true, [
                ['name' => 'TSH', 'short' => 'TSH', 'unit' => 'µIU/mL', 'rangeMale' => '0.4-4.0', 'rangeFemale' => '0.4-4.0', 'rangeChild' => '0.7-6.0', 'criticalLow' => '< 0.01', 'criticalHigh' => '> 100'],
                ['name' => 'Free T4', 'short' => 'FT4', 'unit' => 'ng/dL', 'rangeMale' => '0.8-1.8', 'rangeFemale' => '0.8-1.8', 'rangeChild' => '0.9-2.3', 'criticalLow' => '< 0.4', 'criticalHigh' => '> 5.0'],
                ['name' => 'Free T3', 'short' => 'FT3', 'unit' => 'pg/mL', 'rangeMale' => '2.3-4.2', 'rangeFemale' => '2.3-4.2', 'rangeChild' => '2.0-5.0', 'criticalLow' => '', 'criticalHigh' => ''],
            ]],
            ['TEST-009', 'Urine Complete Examination', 'UCE', 'Clinical Chemistry', 'Routine', 'Urine', '20-30 mL', 'Sterile container', 'No', null, '2 hours', '1 hour', 500, 800, true, [
                ['name' => 'Color', 'short' => 'Color', 'unit' => '', 'rangeMale' => 'Pale Yellow', 'rangeFemale' => 'Pale Yellow', 'rangeChild' => 'Pale Yellow', 'criticalLow' => '', 'criticalHigh' => ''],
                ['name' => 'pH', 'short' => 'pH', 'unit' => '', 'rangeMale' => '4.5-8.0', 'rangeFemale' => '4.5-8.0', 'rangeChild' => '5.0-7.0', 'criticalLow' => '', 'criticalHigh' => ''],
                ['name' => 'Specific Gravity', 'short' => 'SG', 'unit' => '', 'rangeMale' => '1.005-1.030', 'rangeFemale' => '1.005-1.030', 'rangeChild' => '1.005-1.030', 'criticalLow' => '', 'criticalHigh' => ''],
                ['name' => 'Protein', 'short' => 'Prot', 'unit' => '', 'rangeMale' => 'Negative', 'rangeFemale' => 'Negative', 'rangeChild' => 'Negative', 'criticalLow' => '', 'criticalHigh' => ''],
                ['name' => 'Glucose', 'short' => 'Glu', 'unit' => '', 'rangeMale' => 'Negative', 'rangeFemale' => 'Negative', 'rangeChild' => 'Negative', 'criticalLow' => '', 'criticalHigh' => ''],
            ]],
            ['TEST-010', 'Troponin I (Cardiac)', 'TropI', 'Clinical Chemistry', 'STAT', 'Blood - Serum (Red top)', '3 mL', 'Plain tube', 'No', null, '1 hour', '30 min', 2500, 3500, true, [
                ['name' => 'Troponin I', 'short' => 'TnI', 'unit' => 'ng/mL', 'rangeMale' => '< 0.04', 'rangeFemale' => '< 0.04', 'rangeChild' => '< 0.04', 'criticalLow' => '', 'criticalHigh' => '> 0.4'],
            ]],
            ['TEST-011', 'PT/INR', 'PTINR', 'Hematology', 'Routine', 'Blood - Citrate (Blue top)', '3 mL', 'Citrate tube', 'No', null, '2 hours', '1 hour', 800, 1200, true, [
                ['name' => 'Prothrombin Time', 'short' => 'PT', 'unit' => 'seconds', 'rangeMale' => '11-13.5', 'rangeFemale' => '11-13.5', 'rangeChild' => '11-14', 'criticalLow' => '', 'criticalHigh' => '> 30'],
                ['name' => 'INR', 'short' => 'INR', 'unit' => '', 'rangeMale' => '0.8-1.2', 'rangeFemale' => '0.8-1.2', 'rangeChild' => '0.8-1.2', 'criticalLow' => '', 'criticalHigh' => '> 4.5'],
            ]],
            ['TEST-012', 'D-Dimer', 'DDimer', 'Hematology', 'STAT', 'Blood - Citrate (Blue top)', '3 mL', 'Citrate tube', 'No', null, '2 hours', '1 hour', 3000, 4000, true, [
                ['name' => 'D-Dimer', 'short' => 'DD', 'unit' => 'ng/mL', 'rangeMale' => '< 500', 'rangeFemale' => '< 500', 'rangeChild' => '< 500', 'criticalLow' => '', 'criticalHigh' => '> 5000'],
            ]],
            ['TEST-013', 'Blood Culture', 'BC', 'Microbiology', 'Specialized', 'Blood - Aerobic/Anaerobic', '10 mL', 'Blood culture bottles', 'No', null, '48-72 hours', '24 hours', 2500, 3500, false, []],
            ['TEST-014', 'Urine Culture & Sensitivity', 'UCS', 'Microbiology', 'Specialized', 'Urine', '10-20 mL', 'Sterile container', 'No', null, '48-72 hours', '24 hours', 1500, 2500, false, []],
            ['TEST-015', 'Hepatitis B Surface Antigen', 'HBsAg', 'Serology/Immunology', 'Routine', 'Blood - Serum (Red top)', '3 mL', 'Plain tube', 'No', null, '4 hours', '2 hours', 600, 1000, true, [
                ['name' => 'HBsAg', 'short' => 'HBsAg', 'unit' => '', 'rangeMale' => 'Non-Reactive', 'rangeFemale' => 'Non-Reactive', 'rangeChild' => 'Non-Reactive', 'criticalLow' => '', 'criticalHigh' => ''],
            ]],
            ['TEST-016', 'Anti-HCV', 'HCV', 'Serology/Immunology', 'Routine', 'Blood - Serum (Red top)', '3 mL', 'Plain tube', 'No', null, '4 hours', '2 hours', 600, 1000, true, [
                ['name' => 'Anti-HCV', 'short' => 'HCV', 'unit' => '', 'rangeMale' => 'Non-Reactive', 'rangeFemale' => 'Non-Reactive', 'rangeChild' => 'Non-Reactive', 'criticalLow' => '', 'criticalHigh' => ''],
            ]],
            ['TEST-017', 'HIV 1 & 2 Antibody', 'HIV', 'Serology/Immunology', 'Specialized', 'Blood - Serum (Red top)', '5 mL', 'Plain tube', 'No', null, '4 hours', '2 hours', 1000, 1500, true, [
                ['name' => 'HIV 1/2 Ab', 'short' => 'HIV', 'unit' => '', 'rangeMale' => 'Non-Reactive', 'rangeFemale' => 'Non-Reactive', 'rangeChild' => 'Non-Reactive', 'criticalLow' => '', 'criticalHigh' => ''],
            ]],
            ['TEST-018', 'Widal Test', 'WIDAL', 'Serology/Immunology', 'Routine', 'Blood - Serum (Red top)', '3 mL', 'Plain tube', 'No', null, '2 hours', '1 hour', 500, 800, false, []],
            ['TEST-019', 'C-Reactive Protein', 'CRP', 'Serology/Immunology', 'Routine', 'Blood - Serum (Red top)', '3 mL', 'Plain tube', 'No', null, '2 hours', '1 hour', 800, 1200, true, [
                ['name' => 'CRP (Quantitative)', 'short' => 'CRP', 'unit' => 'mg/L', 'rangeMale' => '< 5', 'rangeFemale' => '< 5', 'rangeChild' => '< 5', 'criticalLow' => '', 'criticalHigh' => '> 200'],
            ]],
            ['TEST-020', 'Serum Electrolytes', 'ELEC', 'Clinical Chemistry', 'Routine', 'Blood - Serum (Red top)', '5 mL', 'Plain tube', 'No', null, '2 hours', '1 hour', 1000, 1500, true, [
                ['name' => 'Sodium', 'short' => 'Na', 'unit' => 'mEq/L', 'rangeMale' => '136-145', 'rangeFemale' => '136-145', 'rangeChild' => '136-145', 'criticalLow' => '< 120', 'criticalHigh' => '> 160'],
                ['name' => 'Potassium', 'short' => 'K', 'unit' => 'mEq/L', 'rangeMale' => '3.5-5.0', 'rangeFemale' => '3.5-5.0', 'rangeChild' => '3.5-5.5', 'criticalLow' => '< 2.5', 'criticalHigh' => '> 6.5'],
                ['name' => 'Chloride', 'short' => 'Cl', 'unit' => 'mEq/L', 'rangeMale' => '98-106', 'rangeFemale' => '98-106', 'rangeChild' => '98-106', 'criticalLow' => '< 80', 'criticalHigh' => '> 120'],
                ['name' => 'Bicarbonate', 'short' => 'HCO3', 'unit' => 'mEq/L', 'rangeMale' => '22-28', 'rangeFemale' => '22-28', 'rangeChild' => '20-28', 'criticalLow' => '< 10', 'criticalHigh' => '> 40'],
            ]],
            ['TEST-021', 'Stool Examination', 'STOOL', 'Microbiology', 'Routine', 'Stool', '5-10 g', 'Stool container', 'No', null, '2 hours', '1 hour', 400, 600, false, []],
            ['TEST-022', 'Malaria Parasite (MP)', 'MP', 'Hematology', 'STAT', 'Blood - EDTA (Purple top)', '3 mL', 'EDTA tube', 'No', null, '1 hour', '30 min', 400, 600, true, [
                ['name' => 'Malaria Parasite', 'short' => 'MP', 'unit' => '', 'rangeMale' => 'Not Seen', 'rangeFemale' => 'Not Seen', 'rangeChild' => 'Not Seen', 'criticalLow' => '', 'criticalHigh' => ''],
            ]],
            ['TEST-023', 'Dengue NS1 Antigen', 'DNS1', 'Serology/Immunology', 'STAT', 'Blood - Serum (Red top)', '3 mL', 'Plain tube', 'No', null, '1 hour', '30 min', 1500, 2000, true, [
                ['name' => 'Dengue NS1 Ag', 'short' => 'NS1', 'unit' => '', 'rangeMale' => 'Negative', 'rangeFemale' => 'Negative', 'rangeChild' => 'Negative', 'criticalLow' => '', 'criticalHigh' => ''],
            ]],
            ['TEST-024', 'Vitamin D (25-OH)', 'VitD', 'Clinical Chemistry', 'Specialized', 'Blood - Serum (Red top)', '5 mL', 'Plain tube', 'No', null, '24 hours', '6 hours', 3000, 4000, true, [
                ['name' => 'Vitamin D (25-OH)', 'short' => 'VitD', 'unit' => 'ng/mL', 'rangeMale' => '30-100', 'rangeFemale' => '30-100', 'rangeChild' => '30-100', 'criticalLow' => '< 10', 'criticalHigh' => '> 150'],
            ]],
            ['TEST-025', 'Vitamin B12', 'VitB12', 'Clinical Chemistry', 'Specialized', 'Blood - Serum (Red top)', '5 mL', 'Plain tube', 'No', null, '24 hours', '6 hours', 2500, 3500, true, [
                ['name' => 'Vitamin B12', 'short' => 'B12', 'unit' => 'pg/mL', 'rangeMale' => '200-900', 'rangeFemale' => '200-900', 'rangeChild' => '200-900', 'criticalLow' => '< 100', 'criticalHigh' => ''],
            ]],
            ['TEST-026', 'Serum Iron & TIBC', 'IRON', 'Clinical Chemistry', 'Specialized', 'Blood - Serum (Red top)', '5 mL', 'Plain tube', 'Yes', 8, '6 hours', '3 hours', 1500, 2000, true, [
                ['name' => 'Serum Iron', 'short' => 'Fe', 'unit' => 'µg/dL', 'rangeMale' => '65-175', 'rangeFemale' => '50-170', 'rangeChild' => '50-120', 'criticalLow' => '< 30', 'criticalHigh' => '> 300'],
                ['name' => 'TIBC', 'short' => 'TIBC', 'unit' => 'µg/dL', 'rangeMale' => '250-370', 'rangeFemale' => '250-370', 'rangeChild' => '250-400', 'criticalLow' => '', 'criticalHigh' => ''],
                ['name' => 'Ferritin', 'short' => 'Ferr', 'unit' => 'ng/mL', 'rangeMale' => '20-250', 'rangeFemale' => '10-120', 'rangeChild' => '10-200', 'criticalLow' => '< 5', 'criticalHigh' => '> 1000'],
            ]],
            ['TEST-027', 'Semen Analysis', 'SEMEN', 'Microbiology', 'Specialized', 'Semen', '2-5 mL', 'Sterile container', 'No', null, '4 hours', '2 hours', 1500, 2500, false, []],
            ['TEST-028', 'Pregnancy Test (Urine)', 'UPT', 'Clinical Chemistry', 'Routine', 'Urine', '10 mL', 'Sterile container', 'No', null, '30 min', '15 min', 300, 500, true, [
                ['name' => 'hCG (Urine)', 'short' => 'UPT', 'unit' => '', 'rangeMale' => 'N/A', 'rangeFemale' => 'Negative', 'rangeChild' => 'N/A', 'criticalLow' => '', 'criticalHigh' => ''],
            ]],
            ['TEST-029', 'Arterial Blood Gases', 'ABG', 'Clinical Chemistry', 'STAT', 'Blood - Heparinized (Arterial)', '1-2 mL', 'Heparinized syringe', 'No', null, '30 min', '15 min', 2000, 2500, true, [
                ['name' => 'pH', 'short' => 'pH', 'unit' => '', 'rangeMale' => '7.35-7.45', 'rangeFemale' => '7.35-7.45', 'rangeChild' => '7.35-7.45', 'criticalLow' => '< 7.20', 'criticalHigh' => '> 7.60'],
                ['name' => 'pCO2', 'short' => 'pCO2', 'unit' => 'mmHg', 'rangeMale' => '35-45', 'rangeFemale' => '35-45', 'rangeChild' => '35-45', 'criticalLow' => '< 20', 'criticalHigh' => '> 70'],
                ['name' => 'pO2', 'short' => 'pO2', 'unit' => 'mmHg', 'rangeMale' => '80-100', 'rangeFemale' => '80-100', 'rangeChild' => '80-100', 'criticalLow' => '< 40', 'criticalHigh' => ''],
                ['name' => 'HCO3', 'short' => 'HCO3', 'unit' => 'mEq/L', 'rangeMale' => '22-26', 'rangeFemale' => '22-26', 'rangeChild' => '22-26', 'criticalLow' => '< 10', 'criticalHigh' => '> 40'],
            ]],
            ['TEST-030', 'Tissue Biopsy (Histopathology)', 'BIOPSY', 'Histopathology', 'Specialized', 'Tissue/Biopsy', 'Varies', 'Formalin jar', 'No', null, '5-7 days', '3 days', 5000, 7000, false, []],
        ];

        foreach ($tests as $t) {
            LabTest::create([
                'test_code'             => $t[0],
                'test_name'             => $t[1],
                'short_name'            => $t[2],
                'department'            => $t[3],
                'category'              => $t[4],
                'sample_type'           => $t[5],
                'sample_volume'         => $t[6],
                'collection_container'  => $t[7],
                'fasting_required'      => $t[8],
                'fasting_hours'         => $t[9],
                'standard_tat'          => $t[10],
                'stat_tat'              => $t[11],
                'standard_price'        => $t[12],
                'stat_price'            => $t[13],
                'has_components'        => $t[14],
                'components'            => !empty($t[15]) ? $t[15] : null,
                'status'                => 'Active',
                'methodology'           => 'Automated Analyzer',
                'available_in'          => ['In Hospital Lab', 'Walk-in Lab'],
                'order_count'           => rand(10, 500),
            ]);
        }

        $packages = [
            ['PKG-001', 'Basic Health Checkup', 'Comprehensive health screening for routine checkup', ['TEST-001', 'TEST-002', 'TEST-005', 'TEST-006', 'TEST-007', 'TEST-009'], 4500, 2999, 'General Health Screening'],
            ['PKG-002', 'Diabetes Panel', 'Complete diabetes assessment package', ['TEST-002', 'TEST-003', 'TEST-004', 'TEST-007'], 3300, 1999, 'Disease Specific'],
            ['PKG-003', 'Cardiac Risk Assessment', 'Comprehensive cardiac risk evaluation', ['TEST-001', 'TEST-005', 'TEST-010', 'TEST-019', 'TEST-012'], 7300, 4499, 'Disease Specific'],
            ['PKG-004', 'Fever Panel', 'Complete workup for fever of unknown origin', ['TEST-001', 'TEST-018', 'TEST-022', 'TEST-023', 'TEST-019'], 3100, 1799, 'Disease Specific'],
            ['PKG-005', 'Anemia Panel', 'Complete investigation for anemia', ['TEST-001', 'TEST-026', 'TEST-025'], 4800, 2999, 'Disease Specific'],
            ['PKG-006', 'Pre-Employment Checkup', 'Standard pre-employment health screening', ['TEST-001', 'TEST-002', 'TEST-009', 'TEST-015', 'TEST-016', 'TEST-006'], 4200, 2799, 'Pre-Employment'],
            ['PKG-007', 'Thyroid Complete Panel', 'Complete thyroid function evaluation', ['TEST-008', 'TEST-001'], 3300, 2499, 'Disease Specific'],
            ['PKG-008', 'Liver Complete Panel', 'Full hepatic assessment', ['TEST-006', 'TEST-015', 'TEST-016'], 2700, 1799, 'Disease Specific'],
            ['PKG-009', 'Vitamin Panel', 'Essential vitamins assessment', ['TEST-024', 'TEST-025', 'TEST-026'], 7000, 4499, 'General Health Screening'],
            ['PKG-010', 'Annual Health Checkup Premium', 'Comprehensive annual health screening package', ['TEST-001', 'TEST-002', 'TEST-005', 'TEST-006', 'TEST-007', 'TEST-008', 'TEST-009', 'TEST-024', 'TEST-025'], 13500, 7999, 'Annual Checkup'],
        ];

        foreach ($packages as $p) {
            $testCodes = $p[3];
            $testRecords = LabTest::whereIn('test_code', $testCodes)->get();
            $individualTotal = $testRecords->sum('standard_price');
            $pkgPrice = $p[4] > 0 ? $p[5] : $individualTotal;
            $discount = $individualTotal > 0 ? round((($individualTotal - $pkgPrice) / $individualTotal) * 100, 1) : 0;
            $depts = $testRecords->pluck('department')->unique()->values()->all();
            $samples = $testRecords->groupBy('sample_type')->map(function ($g, $type) {
                return ['type' => $type, 'volume' => $g->first()->sample_volume];
            })->values()->all();
            $fasting = $testRecords->contains(fn($t) => $t->fasting_required === 'Yes');
            $maxTat = $testRecords->max('standard_tat');

            LabTestPackage::create([
                'package_code'     => $p[0],
                'package_name'     => $p[1],
                'description'      => $p[2],
                'tests'            => array_map(function ($c) use ($testRecords) {
                    $t = $testRecords->firstWhere('test_code', $c);
                    return $t ? ['testCode' => $c, 'testName' => $t->test_name, 'price' => round($t->standard_price, 2)] : ['testCode' => $c];
                }, $testCodes),
                'individual_total' => $individualTotal,
                'package_price'    => $pkgPrice,
                'discount_percent' => $discount,
                'departments'      => $depts,
                'sample_summary'   => $samples,
                'fasting_required' => $fasting,
                'max_tat'          => $maxTat,
                'status'           => 'Active',
                'target_audience'  => [$p[6]],
                'available_for'    => ['Walk-in Patients', 'Hospital Patients', 'Corporate/Panel'],
                'display_priority' => 'Normal',
                'order_count'      => rand(5, 150),
            ]);
        }
    }
}
