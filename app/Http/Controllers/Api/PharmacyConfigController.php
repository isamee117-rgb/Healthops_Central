<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OpdConfigItem;
use Illuminate\Http\Request;

class PharmacyConfigController extends Controller
{
    const CATEGORIES = ['rx_unit', 'rx_route', 'rx_frequency'];
    const DEPT_ROUTING_DEPTS = ['IPD', 'ER'];

    const DEFAULTS = [
        'rx_unit' => [
            ['name' => 'mg',          'value' => null],
            ['name' => 'ml',          'value' => null],
            ['name' => 'g',           'value' => null],
            ['name' => 'mcg',         'value' => null],
            ['name' => 'IU',          'value' => null],
            ['name' => 'tablet(s)',   'value' => null],
            ['name' => 'capsule(s)',  'value' => null],
            ['name' => 'drops',       'value' => null],
            ['name' => 'puffs',       'value' => null],
            ['name' => 'patch',       'value' => null],
        ],
        'rx_route' => [
            ['name' => 'Oral',                   'value' => null],
            ['name' => 'IV (Intravenous)',        'value' => null],
            ['name' => 'IM (Intramuscular)',      'value' => null],
            ['name' => 'SC (Subcutaneous)',       'value' => null],
            ['name' => 'Topical',                'value' => null],
            ['name' => 'Inhaler',                'value' => null],
            ['name' => 'Sublingual',             'value' => null],
            ['name' => 'Rectal',                 'value' => null],
            ['name' => 'Nasal',                  'value' => null],
            ['name' => 'Otic',                   'value' => null],
        ],
        'rx_frequency' => [
            ['name' => 'OD (Once Daily)',         'value' => 1],
            ['name' => 'BD (Twice Daily)',         'value' => 2],
            ['name' => 'TDS (Three Times Daily)', 'value' => 3],
            ['name' => 'QID (Four Times Daily)',  'value' => 4],
            ['name' => 'PRN (As Needed)',         'value' => 0],
            ['name' => 'SOS (If Required)',       'value' => 0],
            ['name' => 'QHS (At Bedtime)',        'value' => 1],
            ['name' => 'Q4H (Every 4 Hours)',     'value' => 6],
            ['name' => 'Q6H (Every 6 Hours)',     'value' => 4],
            ['name' => 'Q8H (Every 8 Hours)',     'value' => 3],
            ['name' => 'Stat (Immediately)',      'value' => 1],
        ],
    ];

    private function seedDefaults(): void
    {
        foreach (self::DEFAULTS as $category => $items) {
            if (OpdConfigItem::where('category', $category)->count() === 0) {
                foreach ($items as $idx => $item) {
                    OpdConfigItem::create([
                        'category'   => $category,
                        'name'       => $item['name'],
                        'value'      => $item['value'],
                        'is_active'  => true,
                        'sort_order' => $idx,
                    ]);
                }
            }
        }
    }

    private function seedDeptRouting(): void
    {
        foreach (self::DEPT_ROUTING_DEPTS as $dept) {
            OpdConfigItem::firstOrCreate(
                ['category' => 'dept_routing', 'name' => $dept],
                ['is_active' => true, 'sort_order' => 0, 'value' => null]
            );
        }
    }

    // GET /api/pharmacy-config/department-routing
    public function getDeptRouting()
    {
        $this->seedDeptRouting();
        $items = OpdConfigItem::where('category', 'dept_routing')->get()->keyBy('name');
        $result = [];
        foreach (self::DEPT_ROUTING_DEPTS as $dept) {
            $result[$dept] = isset($items[$dept]) ? (bool) $items[$dept]->is_active : true;
        }
        return response()->json($result);
    }

    // PUT /api/pharmacy-config/department-routing
    public function updateDeptRouting(Request $request)
    {
        $this->seedDeptRouting();
        foreach (self::DEPT_ROUTING_DEPTS as $dept) {
            if ($request->has($dept)) {
                OpdConfigItem::where('category', 'dept_routing')
                    ->where('name', $dept)
                    ->update(['is_active' => $request->boolean($dept)]);
            }
        }
        return response()->json(['message' => 'Saved']);
    }

    private function formatItem(OpdConfigItem $item): array
    {
        $out = [
            'id'        => $item->id,
            'name'      => $item->name,
            'isActive'  => $item->is_active,
            'sortOrder' => $item->sort_order,
        ];
        if ($item->category === 'rx_frequency') {
            $out['timesPerDay'] = $item->value;
        }
        return $out;
    }

    // GET /api/pharmacy-config  — all categories grouped (used by config page)
    public function index()
    {
        $this->seedDefaults();

        $items = OpdConfigItem::whereIn('category', self::CATEGORIES)
            ->orderBy('sort_order')->orderBy('name')
            ->get();

        $grouped = $items->groupBy('category')->map(function ($group) {
            return $group->map(fn($item) => $this->formatItem($item))->values();
        });

        return response()->json($grouped);
    }

    // GET /api/pharmacy-config/{category} — active items (used by OPD)
    // For rx_unit / rx_route: returns ["mg", "ml", ...]
    // For rx_frequency: returns [{"name": "OD (Once Daily)", "timesPerDay": 1}, ...]
    public function listByCategory(string $category)
    {
        if (!in_array($category, self::CATEGORIES)) {
            return response()->json(['error' => 'Unknown category'], 404);
        }

        $this->seedDefaults();

        $items = OpdConfigItem::where('category', $category)
            ->where('is_active', true)
            ->orderBy('sort_order')->orderBy('name')
            ->get();

        if ($category === 'rx_frequency') {
            return response()->json($items->map(fn($i) => [
                'name'       => $i->name,
                'timesPerDay' => $i->value,
            ])->values());
        }

        return response()->json($items->pluck('name')->values());
    }

    // POST /api/pharmacy-config
    public function store(Request $request)
    {
        $request->validate([
            'category' => 'required|string|in:rx_unit,rx_route,rx_frequency',
            'name'     => 'required|string|max:150',
        ]);

        $maxOrder = OpdConfigItem::where('category', $request->category)->max('sort_order') ?? -1;

        $item = OpdConfigItem::create([
            'category'   => $request->category,
            'name'       => $request->name,
            'value'      => $request->category === 'rx_frequency' ? ($request->input('timesPerDay') ?? 1) : null,
            'is_active'  => $request->boolean('isActive', true),
            'sort_order' => $maxOrder + 1,
        ]);

        return response()->json($this->formatItem($item), 201);
    }

    // PUT /api/pharmacy-config/{id}
    public function update(Request $request, int $id)
    {
        $item = OpdConfigItem::whereIn('category', self::CATEGORIES)->findOrFail($id);

        if ($request->has('name'))        $item->name       = $request->name;
        if ($request->has('isActive'))    $item->is_active  = $request->boolean('isActive');
        if ($request->has('sortOrder'))   $item->sort_order = $request->sortOrder;
        if ($request->has('timesPerDay') && $item->category === 'rx_frequency') {
            $item->value = max(0, (int) $request->timesPerDay);
        }

        $item->save();

        return response()->json($this->formatItem($item));
    }

    // DELETE /api/pharmacy-config/{id}
    public function destroy(int $id)
    {
        $item = OpdConfigItem::whereIn('category', self::CATEGORIES)->findOrFail($id);
        $item->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
