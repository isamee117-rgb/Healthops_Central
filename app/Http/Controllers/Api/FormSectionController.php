<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\FormSection;
use App\Traits\HmsHelpers;
use Illuminate\Http\Request;

class FormSectionController extends Controller
{
    use HmsHelpers;

    public function index(int $formId)
    {
        $sections = FormSection::with('components')
            ->where('form_id', $formId)
            ->orderBy('sort_order')->orderBy('id')->get();
        return response()->json($this->toCamelCollection($sections));
    }

    public function store(Request $request, int $formId)
    {
        try {
            Form::findOrFail($formId);
            $request->validate(['title' => 'required|string|max:150']);
            $maxOrder = FormSection::where('form_id', $formId)->max('sort_order') ?? 0;
            $section = FormSection::create([
                'form_id'        => $formId,
                'title'          => $request->input('title'),
                'description'    => $request->input('description'),
                'is_collapsible' => $request->boolean('isCollapsible'),
                'sort_order'     => $maxOrder + 1,
            ]);
            return response()->json($this->toCamel($section->fresh()), 201);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to create section');
        }
    }

    public function reorder(Request $request)
    {
        try {
            foreach ($request->all() as $item) {
                FormSection::where('id', $item['id'])->update(['sort_order' => $item['sortOrder']]);
            }
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to reorder sections');
        }
    }

    public function update(Request $request, int $id)
    {
        try {
            $section = FormSection::findOrFail($id);
            $data    = [];
            if ($request->has('title'))         $data['title']          = $request->input('title');
            if ($request->has('description'))   $data['description']    = $request->input('description');
            if ($request->has('isCollapsible')) $data['is_collapsible'] = $request->boolean('isCollapsible');
            if ($request->has('sortOrder'))     $data['sort_order']     = $request->input('sortOrder');
            $section->update($data);
            return response()->json($this->toCamel($section->fresh()));
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to update section');
        }
    }

    public function destroy(int $id)
    {
        try {
            FormSection::findOrFail($id)->delete();
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to delete section');
        }
    }
}
