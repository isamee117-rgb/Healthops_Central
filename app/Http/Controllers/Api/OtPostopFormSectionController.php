<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OtPostopFormSection;
use Illuminate\Http\Request;

class OtPostopFormSectionController extends Controller
{
    public function index()
    {
        $sections = OtPostopFormSection::orderBy('sort_order')->orderBy('id')->get();
        return response()->json($sections->map(function ($s) {
            return [
                'id'         => $s->id,
                'key'        => $s->key,
                'label'      => $s->label,
                'isDefault'  => $s->is_default,
                'isEnabled'  => $s->is_enabled,
                'department' => $s->department,
                'sortOrder'  => $s->sort_order,
                'fields'     => $s->fields ?? [],
            ];
        }));
    }

    public function store(Request $request)
    {
        $request->validate([
            'label'  => 'required|string|max:120',
            'fields' => 'required|array|min:1',
        ]);

        $max = OtPostopFormSection::max('sort_order') ?? 0;
        $key = 'custom_po_' . uniqid();

        $section = OtPostopFormSection::create([
            'key'        => $key,
            'label'      => $request->label,
            'is_default' => false,
            'is_enabled' => true,
            'department' => $request->department,
            'sort_order' => $max + 1,
            'fields'     => $request->fields,
        ]);

        return response()->json([
            'id'         => $section->id,
            'key'        => $section->key,
            'label'      => $section->label,
            'isDefault'  => $section->is_default,
            'isEnabled'  => $section->is_enabled,
            'department' => $section->department,
            'sortOrder'  => $section->sort_order,
            'fields'     => $section->fields ?? [],
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $section = OtPostopFormSection::findOrFail($id);

        if (isset($request->isEnabled) || $request->has('isEnabled')) {
            $section->update(['is_enabled' => (bool) $request->isEnabled]);
            return response()->json(['success' => true]);
        }

        if ($section->is_default) {
            return response()->json(['error' => 'Built-in sections cannot be modified'], 403);
        }

        $request->validate([
            'label'  => 'sometimes|required|string|max:120',
            'fields' => 'sometimes|required|array|min:1',
        ]);

        $section->update(array_filter([
            'label'      => $request->label,
            'department' => $request->department,
            'fields'     => $request->fields,
        ], fn($v) => $v !== null));

        return response()->json(['success' => true]);
    }

    public function destroy($id)
    {
        $section = OtPostopFormSection::findOrFail($id);
        if ($section->is_default) {
            return response()->json(['error' => 'Built-in sections cannot be deleted'], 403);
        }
        $section->delete();
        return response()->json(['success' => true]);
    }
}
