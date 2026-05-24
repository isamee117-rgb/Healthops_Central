<?php
namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class PharmacyConfigTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'superadmin', 'is_active' => true]);
    }

    #[Test]
    public function index_includes_medicine_category(): void
    {
        $response = $this->actingAs($this->admin)->getJson('/api/pharmacy-config');

        $response->assertOk();
        $this->assertArrayHasKey('medicine_category', $response->json());
    }

    #[Test]
    public function list_by_category_returns_medicine_category_names(): void
    {
        // Trigger seeding via index first
        $this->actingAs($this->admin)->getJson('/api/pharmacy-config');

        $response = $this->actingAs($this->admin)->getJson('/api/pharmacy-config/medicine_category');

        $response->assertOk();
        $response->assertJsonIsArray();
        $this->assertNotEmpty($response->json());
        $this->assertContains('Analgesics & Antipyretics', $response->json());
    }

    #[Test]
    public function store_rejects_unknown_category(): void
    {
        $response = $this->actingAs($this->admin)->postJson('/api/pharmacy-config', [
            'category' => 'unknown_type',
            'name'     => 'Test',
        ]);

        $response->assertUnprocessable();
    }

    #[Test]
    public function store_accepts_medicine_category(): void
    {
        $response = $this->actingAs($this->admin)->postJson('/api/pharmacy-config', [
            'category' => 'medicine_category',
            'name'     => 'Antidiabetics',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('opd_config_items', [
            'category' => 'medicine_category',
            'name'     => 'Antidiabetics',
        ]);
    }
}
