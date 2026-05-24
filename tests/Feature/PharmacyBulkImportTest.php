<?php
namespace Tests\Feature;

use App\Models\Medicine;
use App\Models\User;
use App\Services\PharmacyBulkImportService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class PharmacyBulkImportTest extends TestCase
{
    use RefreshDatabase;

    private PharmacyBulkImportService $service;
    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new PharmacyBulkImportService();
        $this->admin = User::factory()->create(['role' => 'superadmin', 'is_active' => true]);
    }

    private function makeCsvFile(string $content, string $name = 'test.csv'): UploadedFile
    {
        $path = sys_get_temp_dir() . '/' . $name;
        file_put_contents($path, $content);
        return new UploadedFile($path, $name, 'text/csv', null, true);
    }

    private function validCsvRow(array $overrides = []): string
    {
        $row = array_merge([
            'medicine_code' => 'MED-001',
            'generic_name'  => 'Paracetamol',
            'brand_name'    => 'Panadol',
            'form'          => 'Tablet',
            'category'      => 'Analgesic',
            'manufacturer'  => 'GSK',
            'purchase_price' => '45.00',
            'selling_price'  => '60.00',
            'strength'       => '500mg',
            'stock_unit'     => 'strips',
            'min_stock'      => '50',
            'max_stock'      => '500',
            'reorder_point'  => '100',
            'eoq'            => '200',
            'storage_location'   => '',
            'storage_conditions' => '',
            'abc_class'          => 'C',
            'batch_number'       => '',
            'batch_expiry'       => '',
            'batch_qty'          => '',
            'batch_unit_price'   => '',
            'batch_supplier'     => '',
            'batch_received_date' => '',
        ], $overrides);

        return implode(',', array_values($row));
    }

    private function csvHeaders(): string
    {
        return 'medicine_code,generic_name,brand_name,form,category,manufacturer,'
             . 'purchase_price,selling_price,strength,stock_unit,min_stock,max_stock,'
             . 'reorder_point,eoq,storage_location,storage_conditions,abc_class,'
             . 'batch_number,batch_expiry,batch_qty,batch_unit_price,batch_supplier,batch_received_date';
    }

    // ── parse() tests ────────────────────────────────────────────────────────

    #[Test]
    public function parse_csv_returns_array_of_rows(): void
    {
        $csv = $this->csvHeaders() . "\n" . $this->validCsvRow();
        $file = $this->makeCsvFile($csv);

        $rows = $this->service->parse($file);

        $this->assertCount(1, $rows);
        $this->assertEquals('MED-001', $rows[0]['medicine_code']);
        $this->assertEquals('Paracetamol', $rows[0]['generic_name']);
    }

    #[Test]
    public function parse_csv_skips_blank_rows(): void
    {
        $csv = $this->csvHeaders() . "\n"
             . $this->validCsvRow() . "\n"
             . "\n"   // blank row
             . $this->validCsvRow(['medicine_code' => 'MED-002', 'generic_name' => 'Amoxicillin']);
        $file = $this->makeCsvFile($csv);

        $rows = $this->service->parse($file);

        $this->assertCount(2, $rows);
    }

    // ── validate() tests ─────────────────────────────────────────────────────

    #[Test]
    public function validate_passes_for_valid_data(): void
    {
        $rows = [
            [
                'medicine_code' => 'MED-001', 'generic_name' => 'Paracetamol',
                'brand_name' => 'Panadol', 'form' => 'Tablet', 'category' => 'Analgesic',
                'manufacturer' => 'GSK', 'purchase_price' => '45.00', 'selling_price' => '60.00',
                'strength' => '', 'stock_unit' => 'strips', 'min_stock' => '0',
                'max_stock' => '0', 'reorder_point' => '0', 'eoq' => '0',
                'storage_location' => '', 'storage_conditions' => '', 'abc_class' => 'C',
                'batch_number' => '', 'batch_expiry' => '', 'batch_qty' => '',
                'batch_unit_price' => '', 'batch_supplier' => '', 'batch_received_date' => '',
            ],
        ];

        $result = $this->service->validate($rows);

        $this->assertTrue($result['valid']);
        $this->assertEmpty($result['errors']);
        $this->assertEquals(1, $result['summary']['medicines']);
        $this->assertEquals(0, $result['summary']['with_batch']);
        $this->assertEquals(1, $result['summary']['without_batch']);
    }

    #[Test]
    public function validate_fails_when_required_field_is_empty(): void
    {
        $rows = [
            [
                'medicine_code' => 'MED-001', 'generic_name' => '',  // empty!
                'brand_name' => 'Panadol', 'form' => 'Tablet', 'category' => 'Analgesic',
                'manufacturer' => 'GSK', 'purchase_price' => '45.00', 'selling_price' => '60.00',
                'strength' => '', 'stock_unit' => '', 'min_stock' => '', 'max_stock' => '',
                'reorder_point' => '', 'eoq' => '', 'storage_location' => '',
                'storage_conditions' => '', 'abc_class' => '',
                'batch_number' => '', 'batch_expiry' => '', 'batch_qty' => '',
                'batch_unit_price' => '', 'batch_supplier' => '', 'batch_received_date' => '',
            ],
        ];

        $result = $this->service->validate($rows);

        $this->assertFalse($result['valid']);
        $this->assertCount(1, $result['errors']);
        $this->assertEquals(2, $result['errors'][0]['row']);
        $this->assertEquals('generic_name', $result['errors'][0]['column']);
        $this->assertEquals('Required field is empty', $result['errors'][0]['message']);
    }

    #[Test]
    public function validate_fails_when_medicine_code_already_exists_in_db(): void
    {
        Medicine::create([
            'medicine_id'    => 'MED-EXISTING',
            'medicine_code'  => 'MED-001',
            'generic_name'   => 'Existing Drug',
            'brand_name'     => 'ExBrand',
            'form'           => 'Tablet',
            'category'       => 'X',
            'manufacturer'   => 'X',
            'purchase_price' => 10,
            'selling_price'  => 15,
        ]);

        $rows = [[
            'medicine_code' => 'MED-001', 'generic_name' => 'Paracetamol',
            'brand_name' => 'Panadol', 'form' => 'Tablet', 'category' => 'Analgesic',
            'manufacturer' => 'GSK', 'purchase_price' => '45.00', 'selling_price' => '60.00',
            'strength' => '', 'stock_unit' => '', 'min_stock' => '', 'max_stock' => '',
            'reorder_point' => '', 'eoq' => '', 'storage_location' => '',
            'storage_conditions' => '', 'abc_class' => '',
            'batch_number' => '', 'batch_expiry' => '', 'batch_qty' => '',
            'batch_unit_price' => '', 'batch_supplier' => '', 'batch_received_date' => '',
        ]];

        $result = $this->service->validate($rows);

        $this->assertFalse($result['valid']);
        $this->assertEquals('medicine_code', $result['errors'][0]['column']);
        $this->assertStringContainsString('already exists in database', $result['errors'][0]['message']);
    }

    #[Test]
    public function validate_fails_when_medicine_code_duplicated_within_file(): void
    {
        $row = [
            'medicine_code' => 'MED-001', 'generic_name' => 'Paracetamol',
            'brand_name' => 'Panadol', 'form' => 'Tablet', 'category' => 'Analgesic',
            'manufacturer' => 'GSK', 'purchase_price' => '45.00', 'selling_price' => '60.00',
            'strength' => '', 'stock_unit' => '', 'min_stock' => '', 'max_stock' => '',
            'reorder_point' => '', 'eoq' => '', 'storage_location' => '',
            'storage_conditions' => '', 'abc_class' => '',
            'batch_number' => '', 'batch_expiry' => '', 'batch_qty' => '',
            'batch_unit_price' => '', 'batch_supplier' => '', 'batch_received_date' => '',
        ];

        $result = $this->service->validate([$row, $row]); // same row twice

        $this->assertFalse($result['valid']);
        $this->assertStringContainsString('Duplicate within file', $result['errors'][0]['message']);
    }

    #[Test]
    public function validate_fails_when_batch_columns_partially_filled(): void
    {
        $rows = [[
            'medicine_code' => 'MED-001', 'generic_name' => 'Paracetamol',
            'brand_name' => 'Panadol', 'form' => 'Tablet', 'category' => 'Analgesic',
            'manufacturer' => 'GSK', 'purchase_price' => '45.00', 'selling_price' => '60.00',
            'strength' => '', 'stock_unit' => '', 'min_stock' => '', 'max_stock' => '',
            'reorder_point' => '', 'eoq' => '', 'storage_location' => '',
            'storage_conditions' => '', 'abc_class' => '',
            'batch_number' => 'BT-001', 'batch_expiry' => '', // missing batch_qty!
            'batch_qty' => '', 'batch_unit_price' => '', 'batch_supplier' => '',
            'batch_received_date' => '',
        ]];

        $result = $this->service->validate($rows);

        $this->assertFalse($result['valid']);
        $this->assertStringContainsString('batch_number, batch_expiry, and batch_qty', $result['errors'][0]['message']);
    }

    #[Test]
    public function validate_fails_when_batch_expiry_format_is_wrong(): void
    {
        $rows = [[
            'medicine_code' => 'MED-001', 'generic_name' => 'Paracetamol',
            'brand_name' => 'Panadol', 'form' => 'Tablet', 'category' => 'Analgesic',
            'manufacturer' => 'GSK', 'purchase_price' => '45.00', 'selling_price' => '60.00',
            'strength' => '', 'stock_unit' => '', 'min_stock' => '', 'max_stock' => '',
            'reorder_point' => '', 'eoq' => '', 'storage_location' => '',
            'storage_conditions' => '', 'abc_class' => '',
            'batch_number' => 'BT-001', 'batch_expiry' => '31/12/2026', // wrong format
            'batch_qty' => '100', 'batch_unit_price' => '', 'batch_supplier' => '',
            'batch_received_date' => '',
        ]];

        $result = $this->service->validate($rows);

        $this->assertFalse($result['valid']);
        $this->assertEquals('batch_expiry', $result['errors'][0]['column']);
        $this->assertStringContainsString('Invalid date format', $result['errors'][0]['message']);
    }

    #[Test]
    public function validate_passes_with_valid_batch_columns(): void
    {
        $rows = [[
            'medicine_code' => 'MED-001', 'generic_name' => 'Paracetamol',
            'brand_name' => 'Panadol', 'form' => 'Tablet', 'category' => 'Analgesic',
            'manufacturer' => 'GSK', 'purchase_price' => '45.00', 'selling_price' => '60.00',
            'strength' => '', 'stock_unit' => '', 'min_stock' => '', 'max_stock' => '',
            'reorder_point' => '', 'eoq' => '', 'storage_location' => '',
            'storage_conditions' => '', 'abc_class' => '',
            'batch_number' => 'BT-001', 'batch_expiry' => '2026-12-31',
            'batch_qty' => '100', 'batch_unit_price' => '45.00', 'batch_supplier' => 'GSK',
            'batch_received_date' => '2026-05-20',
        ]];

        $result = $this->service->validate($rows);

        $this->assertTrue($result['valid']);
        $this->assertEquals(1, $result['summary']['with_batch']);
        $this->assertEquals(0, $result['summary']['without_batch']);
    }

    // ── import() tests ───────────────────────────────────────────────────────

    #[Test]
    public function import_creates_medicine_without_batch(): void
    {
        $rows = [[
            'medicine_code' => 'MED-001', 'generic_name' => 'Paracetamol',
            'brand_name' => 'Panadol', 'form' => 'Tablet', 'category' => 'Analgesic',
            'manufacturer' => 'GSK', 'purchase_price' => '45.00', 'selling_price' => '60.00',
            'strength' => '500mg', 'stock_unit' => 'strips', 'min_stock' => '50',
            'max_stock' => '500', 'reorder_point' => '100', 'eoq' => '200',
            'storage_location' => '', 'storage_conditions' => '', 'abc_class' => 'B',
            'batch_number' => '', 'batch_expiry' => '', 'batch_qty' => '',
            'batch_unit_price' => '', 'batch_supplier' => '', 'batch_received_date' => '',
        ]];

        $result = $this->service->import($rows);

        $this->assertEquals(1, $result['medicines']);
        $this->assertEquals(0, $result['batches']);
        $this->assertDatabaseHas('medicines', [
            'medicine_code' => 'MED-001',
            'generic_name'  => 'Paracetamol',
            'brand_name'    => 'Panadol',
            'current_stock' => 0,
            'abc_class'     => 'B',
        ]);
        $this->assertDatabaseCount('medicine_batches', 0);
        $this->assertDatabaseCount('stock_transactions', 0);
    }

    #[Test]
    public function import_creates_medicine_with_batch_and_stock_transaction(): void
    {
        $rows = [[
            'medicine_code' => 'MED-002', 'generic_name' => 'Amoxicillin',
            'brand_name' => 'Amoxil', 'form' => 'Capsule', 'category' => 'Antibiotic',
            'manufacturer' => 'Pfizer', 'purchase_price' => '80.00', 'selling_price' => '110.00',
            'strength' => '250mg', 'stock_unit' => 'strips', 'min_stock' => '30',
            'max_stock' => '300', 'reorder_point' => '80', 'eoq' => '150',
            'storage_location' => '', 'storage_conditions' => '', 'abc_class' => 'C',
            'batch_number' => 'BT-001', 'batch_expiry' => '2026-12-31',
            'batch_qty' => '200', 'batch_unit_price' => '80.00',
            'batch_supplier' => 'Pfizer Dist', 'batch_received_date' => '2026-05-20',
        ]];

        $result = $this->service->import($rows);

        $this->assertEquals(1, $result['medicines']);
        $this->assertEquals(1, $result['batches']);

        $this->assertDatabaseHas('medicines', [
            'medicine_code' => 'MED-002',
            'current_stock' => 200,
        ]);
        $this->assertDatabaseHas('medicine_batches', [
            'batch_number' => 'BT-001',
            'qty_received' => 200,
            'current_qty'  => 200,
        ]);
        $this->assertDatabaseHas('stock_transactions', [
            'type'         => 'import',
            'quantity'     => 200,
            'stock_before' => 0,
            'stock_after'  => 200,
        ]);
    }

    #[Test]
    public function import_creates_multiple_medicines(): void
    {
        $rows = [
            [
                'medicine_code' => 'MED-A', 'generic_name' => 'DrugA',
                'brand_name' => 'BrandA', 'form' => 'Tablet', 'category' => 'Cat',
                'manufacturer' => 'Mfr', 'purchase_price' => '10', 'selling_price' => '15',
                'strength' => '', 'stock_unit' => '', 'min_stock' => '', 'max_stock' => '',
                'reorder_point' => '', 'eoq' => '', 'storage_location' => '',
                'storage_conditions' => '', 'abc_class' => '',
                'batch_number' => '', 'batch_expiry' => '', 'batch_qty' => '',
                'batch_unit_price' => '', 'batch_supplier' => '', 'batch_received_date' => '',
            ],
            [
                'medicine_code' => 'MED-B', 'generic_name' => 'DrugB',
                'brand_name' => 'BrandB', 'form' => 'Syrup', 'category' => 'Cat',
                'manufacturer' => 'Mfr', 'purchase_price' => '20', 'selling_price' => '30',
                'strength' => '', 'stock_unit' => '', 'min_stock' => '', 'max_stock' => '',
                'reorder_point' => '', 'eoq' => '', 'storage_location' => '',
                'storage_conditions' => '', 'abc_class' => '',
                'batch_number' => '', 'batch_expiry' => '', 'batch_qty' => '',
                'batch_unit_price' => '', 'batch_supplier' => '', 'batch_received_date' => '',
            ],
        ];

        $result = $this->service->import($rows);

        $this->assertEquals(2, $result['medicines']);
        $this->assertDatabaseHas('medicines', ['medicine_code' => 'MED-A']);
        $this->assertDatabaseHas('medicines', ['medicine_code' => 'MED-B']);
    }

    // ── HTTP endpoint tests ──────────────────────────────────────────────────

    #[Test]
    public function validate_endpoint_rejects_missing_file(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/pharmacy-bulk-import/validate', []);

        $response->assertUnprocessable();
    }

    #[Test]
    public function validate_endpoint_rejects_wrong_extension(): void
    {
        $file = UploadedFile::fake()->create('import.txt', 10, 'text/plain');

        $response = $this->actingAs($this->admin)
            ->postJson('/api/pharmacy-bulk-import/validate', ['file' => $file]);

        $response->assertUnprocessable();
    }

    #[Test]
    public function validate_endpoint_returns_errors_for_invalid_csv(): void
    {
        $csv = $this->csvHeaders() . "\n" . $this->validCsvRow(['generic_name' => '']);
        $file = $this->makeCsvFile($csv);

        $response = $this->actingAs($this->admin)
            ->postJson('/api/pharmacy-bulk-import/validate', ['file' => $file]);

        $response->assertOk()
            ->assertJsonPath('valid', false)
            ->assertJsonStructure(['valid', 'errors' => [['row', 'column', 'message']]]);
    }

    #[Test]
    public function validate_endpoint_returns_summary_for_valid_csv(): void
    {
        $csv = $this->csvHeaders() . "\n" . $this->validCsvRow();
        $file = $this->makeCsvFile($csv);

        $response = $this->actingAs($this->admin)
            ->postJson('/api/pharmacy-bulk-import/validate', ['file' => $file]);

        $response->assertOk()
            ->assertJsonPath('valid', true)
            ->assertJsonStructure(['valid', 'summary' => ['medicines', 'with_batch', 'without_batch'], 'preview']);
    }

    #[Test]
    public function import_endpoint_creates_medicines(): void
    {
        $csv = $this->csvHeaders() . "\n" . $this->validCsvRow();
        $file = $this->makeCsvFile($csv, 'import.csv');

        $response = $this->actingAs($this->admin)
            ->postJson('/api/pharmacy-bulk-import/import', ['file' => $file]);

        $response->assertOk()
            ->assertJsonPath('imported.medicines', 1)
            ->assertJsonPath('imported.batches', 0);

        $this->assertDatabaseHas('medicines', ['medicine_code' => 'MED-001']);
    }

    #[Test]
    public function import_endpoint_rejects_invalid_file(): void
    {
        $csv = $this->csvHeaders() . "\n" . $this->validCsvRow(['selling_price' => 'not-a-number']);
        $file = $this->makeCsvFile($csv, 'bad.csv');

        $response = $this->actingAs($this->admin)
            ->postJson('/api/pharmacy-bulk-import/import', ['file' => $file]);

        $response->assertStatus(422);
        $this->assertDatabaseMissing('medicines', ['medicine_code' => 'MED-001']);
    }

    #[Test]
    public function template_endpoint_returns_xlsx_download(): void
    {
        $response = $this->actingAs($this->admin)
            ->get('/api/pharmacy-bulk-import/template');

        $response->assertOk()
            ->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }

    #[Test]
    public function template_endpoint_returns_csv_download(): void
    {
        $response = $this->actingAs($this->admin)
            ->get('/api/pharmacy-bulk-import/template?format=csv');

        $response->assertOk()
            ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    }

    // ── category validation tests ────────────────────────────────────────────

    #[Test]
    public function validate_fails_when_category_not_in_configured_list(): void
    {
        \App\Models\OpdConfigItem::create([
            'category'   => 'medicine_category',
            'name'       => 'Analgesics & Antipyretics',
            'value'      => null,
            'is_active'  => true,
            'sort_order' => 0,
        ]);

        $csv = $this->csvHeaders() . "\n" . $this->validCsvRow(['category' => 'InvalidCat']);
        $rows = $this->service->parse($this->makeCsvFile($csv));
        $result = $this->service->validate($rows);

        $this->assertFalse($result['valid']);
        $categoryError = collect($result['errors'])->first(fn($e) => $e['column'] === 'category');
        $this->assertNotNull($categoryError);
        $this->assertStringContainsString('InvalidCat', $categoryError['message']);
    }

    #[Test]
    public function validate_passes_when_category_matches_configured_list(): void
    {
        \App\Models\OpdConfigItem::create([
            'category'   => 'medicine_category',
            'name'       => 'Analgesics & Antipyretics',
            'value'      => null,
            'is_active'  => true,
            'sort_order' => 0,
        ]);

        $csv = $this->csvHeaders() . "\n" . $this->validCsvRow(['category' => 'Analgesics & Antipyretics']);
        $rows = $this->service->parse($this->makeCsvFile($csv));
        $result = $this->service->validate($rows);

        $this->assertTrue($result['valid']);
        $categoryErrors = collect($result['errors'])->filter(fn($e) => $e['column'] === 'category');
        $this->assertCount(0, $categoryErrors);
    }

    #[Test]
    public function validate_fails_when_category_is_inactive(): void
    {
        // Create an active category to enable validation
        \App\Models\OpdConfigItem::create([
            'category'   => 'medicine_category',
            'name'       => 'Antibiotics',
            'value'      => null,
            'is_active'  => true,
            'sort_order' => 0,
        ]);

        // Create an inactive category
        \App\Models\OpdConfigItem::create([
            'category'   => 'medicine_category',
            'name'       => 'Analgesics & Antipyretics',
            'value'      => null,
            'is_active'  => false,
            'sort_order' => 1,
        ]);

        // Try to use the inactive category
        $csv = $this->csvHeaders() . "\n" . $this->validCsvRow(['category' => 'Analgesics & Antipyretics']);
        $rows = $this->service->parse($this->makeCsvFile($csv));
        $result = $this->service->validate($rows);

        // Should fail because only active categories are allowed
        $this->assertFalse($result['valid']);
        $categoryError = collect($result['errors'])->first(fn($e) => $e['column'] === 'category');
        $this->assertNotNull($categoryError);
    }

    #[Test]
    public function validate_skips_category_check_when_no_categories_configured(): void
    {
        // No OpdConfigItem rows for medicine_category — graceful degradation

        $csv = $this->csvHeaders() . "\n" . $this->validCsvRow(['category' => 'AnythingAtAll']);
        $rows = $this->service->parse($this->makeCsvFile($csv));
        $result = $this->service->validate($rows);

        $categoryErrors = collect($result['errors'])->filter(fn($e) => $e['column'] === 'category');
        $this->assertCount(0, $categoryErrors);
    }
}
