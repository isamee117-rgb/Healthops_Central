<?php
namespace Tests\Feature;

use App\Models\User;
use App\Models\FormGroup;
use App\Models\Form;
use App\Models\FormSection;
use App\Models\FormComponent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class FormBuilderTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create([
            'role'      => 'superadmin',
            'is_active' => true,
        ]);
    }

    #[Test]
    public function can_list_form_groups(): void
    {
        FormGroup::create(['name' => 'IPD', 'context' => 'ipd', 'sort_order' => 1, 'is_active' => true]);

        $response = $this->actingAs($this->admin)->getJson('/api/form-groups');

        $response->assertOk()->assertJsonCount(1)->assertJsonFragment(['name' => 'IPD']);
    }

    #[Test]
    public function can_create_form_group(): void
    {
        $response = $this->actingAs($this->admin)->postJson('/api/form-groups', [
            'name'    => 'OPD',
            'context' => 'opd',
        ]);

        $response->assertCreated()->assertJsonFragment(['name' => 'OPD']);
        $this->assertDatabaseHas('form_groups', ['name' => 'OPD', 'context' => 'opd']);
    }

    #[Test]
    public function can_update_form_group(): void
    {
        $group = FormGroup::create(['name' => 'Old', 'context' => 'ipd', 'sort_order' => 1, 'is_active' => true]);

        $response = $this->actingAs($this->admin)->patchJson("/api/form-groups/{$group->id}", [
            'name' => 'New',
        ]);

        $response->assertOk()->assertJsonFragment(['name' => 'New']);
        $this->assertDatabaseHas('form_groups', ['id' => $group->id, 'name' => 'New']);
    }

    #[Test]
    public function can_delete_form_group(): void
    {
        $group = FormGroup::create(['name' => 'Test', 'context' => 'general', 'sort_order' => 1, 'is_active' => true]);

        $response = $this->actingAs($this->admin)->deleteJson("/api/form-groups/{$group->id}");

        $response->assertOk()->assertJsonFragment(['success' => true]);
        $this->assertDatabaseMissing('form_groups', ['id' => $group->id]);
    }

    #[Test]
    public function can_create_form_under_group(): void
    {
        $group = FormGroup::create(['name' => 'IPD', 'context' => 'ipd', 'sort_order' => 1, 'is_active' => true]);

        $response = $this->actingAs($this->admin)->postJson("/api/form-groups/{$group->id}/forms", [
            'name' => 'Pre-Op Checklist',
        ]);

        $response->assertCreated()->assertJsonFragment(['name' => 'Pre-Op Checklist']);
        $this->assertDatabaseHas('forms', ['form_group_id' => $group->id, 'name' => 'Pre-Op Checklist']);
    }

    #[Test]
    public function can_create_section_under_form(): void
    {
        $group = FormGroup::create(['name' => 'IPD', 'context' => 'ipd', 'sort_order' => 1, 'is_active' => true]);
        $form  = Form::create(['form_group_id' => $group->id, 'name' => 'Checklist', 'sort_order' => 1, 'is_active' => true]);

        $response = $this->actingAs($this->admin)->postJson("/api/forms/{$form->id}/sections", [
            'title' => 'Patient Details',
        ]);

        $response->assertCreated()->assertJsonFragment(['title' => 'Patient Details']);
        $this->assertDatabaseHas('form_sections', ['form_id' => $form->id, 'title' => 'Patient Details']);
    }

    #[Test]
    public function can_create_component_under_section(): void
    {
        $group   = FormGroup::create(['name' => 'IPD', 'context' => 'ipd', 'sort_order' => 1, 'is_active' => true]);
        $form    = Form::create(['form_group_id' => $group->id, 'name' => 'Checklist', 'sort_order' => 1, 'is_active' => true]);
        $section = FormSection::create(['form_id' => $form->id, 'title' => 'Details', 'sort_order' => 1]);

        $response = $this->actingAs($this->admin)->postJson("/api/form-sections/{$section->id}/components", [
            'type'   => 'text_input',
            'label'  => 'Patient Name',
            'config' => ['placeholder' => ''],
        ]);

        $response->assertCreated()->assertJsonFragment(['type' => 'text_input', 'label' => 'Patient Name']);
        $this->assertDatabaseHas('form_components', ['form_section_id' => $section->id, 'type' => 'text_input']);
    }

    #[Test]
    public function can_get_full_form_with_sections_and_components(): void
    {
        $group   = FormGroup::create(['name' => 'IPD', 'context' => 'ipd', 'sort_order' => 1, 'is_active' => true]);
        $form    = Form::create(['form_group_id' => $group->id, 'name' => 'Checklist', 'sort_order' => 1, 'is_active' => true]);
        $section = FormSection::create(['form_id' => $form->id, 'title' => 'Details', 'sort_order' => 1]);
        FormComponent::create(['form_section_id' => $section->id, 'type' => 'text_input', 'label' => 'Name', 'sort_order' => 1]);

        $response = $this->actingAs($this->admin)->getJson("/api/forms/{$form->id}/full");

        $response->assertOk()
            ->assertJsonFragment(['name' => 'Checklist'])
            ->assertJsonFragment(['title' => 'Details'])
            ->assertJsonFragment(['label' => 'Name']);
    }

    #[Test]
    public function cascades_delete_from_group_to_components(): void
    {
        $group   = FormGroup::create(['name' => 'IPD', 'context' => 'ipd', 'sort_order' => 1, 'is_active' => true]);
        $form    = Form::create(['form_group_id' => $group->id, 'name' => 'F', 'sort_order' => 1, 'is_active' => true]);
        $section = FormSection::create(['form_id' => $form->id, 'title' => 'S', 'sort_order' => 1]);
        $comp    = FormComponent::create(['form_section_id' => $section->id, 'type' => 'text_input', 'label' => 'L', 'sort_order' => 1]);

        $this->actingAs($this->admin)->deleteJson("/api/form-groups/{$group->id}");

        $this->assertDatabaseMissing('forms',           ['id' => $form->id]);
        $this->assertDatabaseMissing('form_sections',   ['id' => $section->id]);
        $this->assertDatabaseMissing('form_components', ['id' => $comp->id]);
    }
}
