<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OpdVitalField;
use Illuminate\Http\Request;

class OpdVitalFieldController extends Controller
{
    public function index()
    {
        $fields = OpdVitalField::orderBy('sort_order')->get();

        return response()->json($fields->map(function ($f) {
            return [
                'fieldKey'  => $f->field_key,
                'label'     => $f->label,
                'icon'      => $f->icon,
                'unit'      => $f->unit,
                'inputType' => $f->input_type,
                'isVisible' => (bool) $f->is_visible,
                'sortOrder' => $f->sort_order,
            ];
        }));
    }

    public function update(Request $request, string $fieldKey)
    {
        $field = OpdVitalField::where('field_key', $fieldKey)->firstOrFail();

        $request->validate([
            'isVisible' => 'required|boolean',
        ]);

        $field->update(['is_visible' => $request->boolean('isVisible')]);

        return response()->json([
            'fieldKey'  => $field->field_key,
            'label'     => $field->label,
            'isVisible' => (bool) $field->is_visible,
        ]);
    }
}
