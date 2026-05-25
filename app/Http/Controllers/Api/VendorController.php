<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class VendorController extends Controller
{
    public function index()
    {
        $vendors = Supplier::withCount('purchaseOrders')->orderBy('name')->get()->map(fn($s) => $this->format($s));
        return response()->json($vendors->values());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'         => 'required|string|max:255',
            'contactPerson'=> 'nullable|string|max:255',
            'phone'        => 'nullable|string|max:50',
            'email'        => 'nullable|email|max:255',
            'address'      => 'nullable|string',
            'paymentTerms' => 'nullable|string|max:100',
            'leadTimeDays' => 'nullable|integer|min:0',
        ]);

        $vendor = Supplier::create([
            'supplier_id'    => 'SUP-' . strtoupper(Str::random(6)),
            'name'           => $validated['name'],
            'contact_person' => $validated['contactPerson'] ?? null,
            'phone'          => $validated['phone'] ?? null,
            'email'          => $validated['email'] ?? null,
            'address'        => $validated['address'] ?? null,
            'payment_terms'  => $validated['paymentTerms'] ?? null,
            'lead_time_days' => $validated['leadTimeDays'] ?? 0,
            'is_active'      => true,
        ]);

        return response()->json(['success' => true, 'vendor' => $this->format($vendor)], 201);
    }

    public function update(Request $request, $id)
    {
        $vendor = Supplier::where('supplier_id', $id)->firstOrFail();

        $validated = $request->validate([
            'name'         => 'required|string|max:255',
            'contactPerson'=> 'nullable|string|max:255',
            'phone'        => 'nullable|string|max:50',
            'email'        => 'nullable|email|max:255',
            'address'      => 'nullable|string',
            'paymentTerms' => 'nullable|string|max:100',
            'leadTimeDays' => 'nullable|integer|min:0',
        ]);

        $vendor->update([
            'name'           => $validated['name'],
            'contact_person' => $validated['contactPerson'] ?? null,
            'phone'          => $validated['phone'] ?? null,
            'email'          => $validated['email'] ?? null,
            'address'        => $validated['address'] ?? null,
            'payment_terms'  => $validated['paymentTerms'] ?? null,
            'lead_time_days' => $validated['leadTimeDays'] ?? 0,
        ]);

        return response()->json(['success' => true, 'vendor' => $this->format($vendor->fresh())]);
    }

    public function toggleStatus($id)
    {
        $vendor = Supplier::where('supplier_id', $id)->firstOrFail();
        $vendor->update(['is_active' => !$vendor->is_active]);
        return response()->json(['success' => true, 'isActive' => $vendor->fresh()->is_active]);
    }

    public function destroy($id)
    {
        $vendor = Supplier::where('supplier_id', $id)->firstOrFail();

        if ($vendor->purchaseOrders()->exists()) {
            return response()->json(['error' => 'Cannot delete vendor with existing purchase orders. Deactivate instead.'], 422);
        }

        $vendor->delete();
        return response()->json(['success' => true]);
    }

    private function format(Supplier $s): array
    {
        return [
            'id'            => $s->supplier_id,
            'name'          => $s->name,
            'contactPerson' => $s->contact_person,
            'phone'         => $s->phone,
            'email'         => $s->email,
            'address'       => $s->address,
            'paymentTerms'  => $s->payment_terms,
            'leadTimeDays'  => $s->lead_time_days,
            'isActive'      => $s->is_active,
            'poCount'       => $s->purchase_orders_count ?? 0,
        ];
    }
}
