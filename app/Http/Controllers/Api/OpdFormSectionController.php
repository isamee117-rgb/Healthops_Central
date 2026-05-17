<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FormSection;
use App\Traits\HmsHelpers;

class OpdFormSectionController extends Controller
{
    use HmsHelpers;

    public function index()
    {
        $sections = FormSection::whereHas('form.formGroup', fn($q) => $q->where('context', 'opd'))
            ->orderBy('sort_order')->orderBy('id')->get()
            ->map(fn($s) => [
                'id'         => $s->id,
                'key'        => 'section_' . $s->id,
                'label'      => $s->title,
                'is_default' => true,
                'is_enabled' => true,
                'department' => null,
                'sort_order' => $s->sort_order,
                'fields'     => null,
                'created_at' => $s->created_at,
                'updated_at' => $s->updated_at,
            ]);

        return response()->json($this->toCamelCollection($sections));
    }
}
