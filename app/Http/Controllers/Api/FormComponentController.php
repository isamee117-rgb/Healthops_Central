<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FormComponent;
use App\Models\FormSection;
use App\Traits\HmsHelpers;
use Illuminate\Http\Request;

class FormComponentController extends Controller
{
    use HmsHelpers;

    public function store(Request $request, int $sectionId)
    {
        try {
            FormSection::findOrFail($sectionId);
            $request->validate([
                'type'   => 'required|in:text_input,textarea,checkbox,radio,dropdown,date,time,dynamic_table,signature,header',
                'label'  => 'required|string|max:200',
                'config' => 'nullable|array',
            ]);
            $maxOrder = FormComponent::where('form_section_id', $sectionId)->max('sort_order') ?? 0;
            $component = FormComponent::create([
                'form_section_id' => $sectionId,
                'type'            => $request->input('type'),
                'label'           => $request->input('label'),
                'sort_order'      => $maxOrder + 1,
                'config'          => $request->input('config'),
            ]);
            return response()->json($this->toCamel($component->fresh()), 201);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to create component');
        }
    }

    public function reorder(Request $request)
    {
        try {
            foreach ($request->all() as $item) {
                FormComponent::where('id', $item['id'])->update(['sort_order' => $item['sortOrder']]);
            }
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to reorder components');
        }
    }

    public function update(Request $request, int $id)
    {
        try {
            $component = FormComponent::findOrFail($id);
            $data      = [];
            if ($request->has('label'))     $data['label']      = $request->input('label');
            if ($request->has('config'))    $data['config']     = $request->input('config');
            if ($request->has('sortOrder')) $data['sort_order'] = $request->input('sortOrder');
            $component->update($data);
            return response()->json($this->toCamel($component->fresh()));
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to update component');
        }
    }

    public function destroy(int $id)
    {
        try {
            FormComponent::findOrFail($id)->delete();
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to delete component');
        }
    }
}
