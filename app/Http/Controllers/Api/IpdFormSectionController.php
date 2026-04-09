<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\IpdFormSection;
use App\Traits\HmsHelpers;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class IpdFormSectionController extends Controller
{
    use HmsHelpers;

    public function index()
    {
        $sections = IpdFormSection::orderBy('sort_order')->orderBy('id')->get();
        return response()->json($this->toCamelCollection($sections));
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'label'  => 'required|string|max:100',
                'fields' => 'required|array|min:1',
            ]);

            $key      = 'custom_' . Str::slug($request->input('label'), '_') . '_' . time();
            $maxOrder = IpdFormSection::max('sort_order') ?? 0;

            $section = IpdFormSection::create([
                'key'        => $key,
                'label'      => $request->input('label'),
                'is_default' => false,
                'is_enabled' => true,
                'department' => $request->input('department') ?: null,
                'sort_order' => $maxOrder + 1,
                'fields'     => $request->input('fields', []),
            ]);

            return response()->json($this->toCamel($section), 201);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to create record');
        }
    }

    public function update(Request $request, int $id)
    {
        try {
            $section    = IpdFormSection::findOrFail($id);
            $updateData = [];

            if ($request->has('isEnabled'))  $updateData['is_enabled']  = (bool) $request->input('isEnabled');
            if ($request->has('label'))      $updateData['label']       = $request->input('label');
            if ($request->has('department')) $updateData['department']  = $request->input('department') ?: null;
            if ($request->has('fields'))     $updateData['fields']      = $request->input('fields');

            $section->update($updateData);
            return response()->json($this->toCamel($section->fresh()));
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to update record');
        }
    }

    public function destroy(int $id)
    {
        try {
            $section = IpdFormSection::findOrFail($id);
            if ($section->is_default) {
                return response()->json(['error' => 'Cannot delete a built-in section.'], 403);
            }
            $section->delete();
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to delete record');
        }
    }
}
