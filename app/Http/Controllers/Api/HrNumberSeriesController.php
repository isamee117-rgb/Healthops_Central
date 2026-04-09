<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HrNumberSeries;
use App\Models\Doctor;
use Illuminate\Http\Request;

class HrNumberSeriesController extends Controller
{
    public function index()
    {
        $series = HrNumberSeries::orderBy('id')->get();

        $result = $series->map(function ($s) {
            return [
                'seriesKey'     => $s->series_key,
                'label'         => $s->label,
                'prefix'        => $s->prefix,
                'startingNumber'=> $s->starting_number,
                'padding'       => $s->padding,
                'preview'       => $this->buildPreview($s),
            ];
        });

        return response()->json($result);
    }

    public function update(Request $request, string $seriesKey)
    {
        $series = HrNumberSeries::where('series_key', $seriesKey)->firstOrFail();

        $request->validate([
            'prefix'         => 'required|string|max:20',
            'startingNumber' => 'required|integer|min:1',
            'padding'        => 'required|integer|min:0|max:10',
        ]);

        $series->update([
            'prefix'          => $request->input('prefix'),
            'starting_number' => $request->input('startingNumber'),
            'padding'         => $request->input('padding'),
        ]);

        return response()->json([
            'seriesKey'      => $series->series_key,
            'label'          => $series->label,
            'prefix'         => $series->prefix,
            'startingNumber' => $series->starting_number,
            'padding'        => $series->padding,
            'preview'        => $this->buildPreview($series),
        ]);
    }

    private function buildPreview(HrNumberSeries $series): string
    {
        $num = max($series->starting_number, 1);
        $numStr = $series->padding > 0
            ? str_pad($num, $series->padding, '0', STR_PAD_LEFT)
            : (string) $num;
        return $series->prefix . $numStr;
    }
}
