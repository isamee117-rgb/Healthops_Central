<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\FormGroup;
use App\Traits\HmsHelpers;
use Illuminate\Http\Request;

class FormController extends Controller
{
    use HmsHelpers;

    public function index(int $groupId)
    {
        $forms = Form::where('form_group_id', $groupId)
            ->orderBy('sort_order')->orderBy('id')->get();
        return response()->json($this->toCamelCollection($forms));
    }

    public function store(Request $request, int $groupId)
    {
        try {
            FormGroup::findOrFail($groupId);
            $request->validate([
                'name'         => 'required|string|max:150',
                'description'  => 'nullable|string',
                'instructions' => 'nullable|string',
                'declaration'  => 'nullable|string',
            ]);
            $maxOrder = Form::where('form_group_id', $groupId)->max('sort_order') ?? 0;
            $form = Form::create([
                'form_group_id' => $groupId,
                'name'          => $request->input('name'),
                'description'   => $request->input('description'),
                'instructions'  => $request->input('instructions'),
                'declaration'   => $request->input('declaration'),
                'is_active'     => true,
                'sort_order'    => $maxOrder + 1,
            ]);
            return response()->json($this->toCamel($form->fresh()), 201);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to create form');
        }
    }

    public function reorder(Request $request)
    {
        try {
            foreach ($request->all() as $item) {
                Form::where('id', $item['id'])->update(['sort_order' => $item['sortOrder']]);
            }
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to reorder forms');
        }
    }

    public function update(Request $request, int $id)
    {
        try {
            $form = Form::findOrFail($id);
            $data = [];
            if ($request->has('name'))         $data['name']         = $request->input('name');
            if ($request->has('description'))  $data['description']  = $request->input('description');
            if ($request->has('instructions')) $data['instructions'] = $request->input('instructions');
            if ($request->has('declaration'))  $data['declaration']  = $request->input('declaration');
            if ($request->has('isActive'))     $data['is_active']    = $request->boolean('isActive');
            $form->update($data);
            return response()->json($this->toCamel($form->fresh()));
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to update form');
        }
    }

    public function destroy(int $id)
    {
        try {
            Form::findOrFail($id)->delete();
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to delete form');
        }
    }

    public function full(int $id)
    {
        try {
            $form = Form::with(['sections.components'])->findOrFail($id);
            return response()->json($this->toCamel($form->toArray()));
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to load form');
        }
    }

    public function byContext(string $context)
    {
        try {
            $groups = FormGroup::with(['forms' => function ($q) {
                $q->where('is_active', true)->orderBy('sort_order')->orderBy('id');
            }])
            ->where('context', $context)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->filter(fn($g) => $g->forms->isNotEmpty())
            ->values();

            return response()->json($this->toCamelCollection($groups));
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to load forms');
        }
    }
}
