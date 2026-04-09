<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OpdConfigItem;
use Illuminate\Http\Request;

class OpdConfigController extends Controller
{
    public function index(Request $request)
    {
        $query = OpdConfigItem::ordered();

        if ($request->has('category')) {
            $query->byCategory($request->input('category'));
        }

        if ($request->has('active_only') && $request->input('active_only') === 'true') {
            $query->active();
        }

        $items = $query->get();

        $grouped = $items->groupBy('category')->map(function ($group) {
            return $group->map(function ($item) {
                return [
                    'id'        => $item->id,
                    'name'      => $item->name,
                    'isActive'  => $item->is_active,
                    'sortOrder' => $item->sort_order,
                ];
            })->values();
        });

        return response()->json($grouped);
    }

    public function listByCategory(string $category)
    {
        $items = OpdConfigItem::byCategory($category)->active()->ordered()->get();
        return response()->json($items->pluck('name')->values());
    }

    public function store(Request $request)
    {
        $request->validate([
            'category' => 'required|string|in:opd_visit_type,opd_symptom,ipd_admission_type',
            'name'     => 'required|string|max:150',
        ]);

        $maxOrder = OpdConfigItem::byCategory($request->input('category'))->max('sort_order') ?? -1;

        $item = OpdConfigItem::create([
            'category'   => $request->input('category'),
            'name'       => $request->input('name'),
            'is_active'  => $request->boolean('isActive', true),
            'sort_order' => $maxOrder + 1,
        ]);

        return response()->json([
            'id'        => $item->id,
            'name'      => $item->name,
            'category'  => $item->category,
            'isActive'  => $item->is_active,
            'sortOrder' => $item->sort_order,
        ], 201);
    }

    public function update(Request $request, int $id)
    {
        $item = OpdConfigItem::findOrFail($id);

        if ($request->has('name'))      { $item->name       = $request->input('name'); }
        if ($request->has('isActive'))  { $item->is_active  = $request->boolean('isActive'); }
        if ($request->has('sortOrder')) { $item->sort_order = $request->input('sortOrder'); }

        $item->save();

        return response()->json([
            'id'        => $item->id,
            'name'      => $item->name,
            'category'  => $item->category,
            'isActive'  => $item->is_active,
            'sortOrder' => $item->sort_order,
        ]);
    }

    public function destroy(int $id)
    {
        $item = OpdConfigItem::findOrFail($id);
        $item->delete();
        return response()->json(['message' => 'Item deleted']);
    }
}
