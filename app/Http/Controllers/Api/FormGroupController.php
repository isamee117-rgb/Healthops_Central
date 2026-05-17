<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FormGroup;
use App\Traits\HmsHelpers;
use Illuminate\Http\Request;

class FormGroupController extends Controller
{
    use HmsHelpers;

    public function index()
    {
        $groups = FormGroup::with('forms')->orderBy('sort_order')->orderBy('id')->get();
        return response()->json($this->toCamelCollection($groups));
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'name'        => 'required|string|max:100',
                'context'     => 'required|in:ipd,opd,emergency,ot,general',
                'description' => 'nullable|string',
            ]);
            $maxOrder = FormGroup::max('sort_order') ?? 0;
            $group = FormGroup::create([
                'name'        => $request->input('name'),
                'context'     => $request->input('context'),
                'description' => $request->input('description'),
                'sort_order'  => $maxOrder + 1,
                'is_active'   => true,
            ]);
            return response()->json($this->toCamel($group->fresh()), 201);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to create form group');
        }
    }

    public function reorder(Request $request)
    {
        try {
            foreach ($request->all() as $item) {
                FormGroup::where('id', $item['id'])->update(['sort_order' => $item['sortOrder']]);
            }
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to reorder form groups');
        }
    }

    public function update(Request $request, int $id)
    {
        try {
            $group = FormGroup::findOrFail($id);
            $data  = [];
            if ($request->has('name'))        $data['name']        = $request->input('name');
            if ($request->has('description')) $data['description'] = $request->input('description');
            if ($request->has('isActive'))    $data['is_active']   = $request->boolean('isActive');
            $group->update($data);
            return response()->json($this->toCamel($group->fresh()));
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to update form group');
        }
    }

    public function destroy(int $id)
    {
        try {
            FormGroup::findOrFail($id)->delete();
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to delete form group');
        }
    }
}
