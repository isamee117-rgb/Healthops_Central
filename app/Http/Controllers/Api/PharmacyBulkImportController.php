<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PharmacyBulkImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PharmacyBulkImportController extends Controller
{
    public function __construct(private PharmacyBulkImportService $service) {}

    public function template(Request $request): StreamedResponse
    {
        $format = in_array($request->query('format'), ['csv', 'xlsx']) ? $request->query('format') : 'xlsx';
        return $this->service->generateTemplate($format);
    }

    public function validate(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|extensions:xlsx,csv|max:5120',
        ]);

        $file = $request->file('file');

        try {
            $rows = $this->service->parse($file);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }

        if (count($rows) > PharmacyBulkImportService::MAX_ROWS) {
            return response()->json([
                'error' => 'File contains more than ' . PharmacyBulkImportService::MAX_ROWS . ' rows — split into smaller batches',
            ], 422);
        }

        $result = $this->service->validate($rows);

        return response()->json($result);
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|extensions:xlsx,csv|max:5120',
        ]);

        try {
            $rows = $this->service->parse($request->file('file'));
        } catch (\InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }

        if (count($rows) > PharmacyBulkImportService::MAX_ROWS) {
            return response()->json([
                'error' => 'File contains more than ' . PharmacyBulkImportService::MAX_ROWS . ' rows',
            ], 422);
        }

        $result = $this->service->validate($rows);

        if (!$result['valid']) {
            return response()->json([
                'error'  => 'Validation failed — fix errors and re-upload',
                'errors' => $result['errors'],
            ], 422);
        }

        try {
            $imported = $this->service->import($rows);
            return response()->json(['imported' => $imported]);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }
}
