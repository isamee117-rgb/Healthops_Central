<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FormSubmission;
use App\Traits\HmsHelpers;
use Illuminate\Http\Request;

class FormSubmissionController extends Controller
{
    use HmsHelpers;

    public function index(Request $request)
    {
        $query = FormSubmission::query();

        if ($request->filled('formId'))      $query->where('form_id', $request->query('formId'));
        if ($request->filled('admissionId')) $query->where('admission_id', $request->query('admissionId'));
        if ($request->filled('sectionId'))   $query->where('form_section_id', $request->query('sectionId'));

        $submissions = $query->latest()->get()->map(function ($s) {
            return [
                'id'            => $s->id,
                'formId'        => $s->form_id,
                'sectionId'     => $s->form_section_id,
                'admissionId'   => $s->admission_id,
                'mrn'           => $s->mrn,
                'context'       => $s->context,
                'data'          => $s->data,
                'submittedBy'   => $s->submitted_by,
                'submittedAt'   => $s->created_at->format('d M Y, H:i'),
            ];
        });

        return response()->json($submissions);
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'formId'      => 'required|exists:forms,id',
                'admissionId' => 'required|string|max:50',
                'mrn'         => 'required|string|max:50',
                'data'        => 'required|array',
            ]);

            $submission = FormSubmission::create([
                'form_id'         => $request->input('formId'),
                'form_section_id' => $request->input('sectionId'),
                'admission_id'    => $request->input('admissionId'),
                'mrn'             => $request->input('mrn'),
                'context'         => $request->input('context', 'ipd'),
                'data'            => $request->input('data'),
                'submitted_by'    => auth()->user()->name ?? null,
            ]);

            return response()->json([
                'id'          => $submission->id,
                'submittedAt' => $submission->created_at->format('d M Y, H:i'),
                'submittedBy' => $submission->submitted_by,
            ], 201);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to save submission');
        }
    }
}
