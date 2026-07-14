<?php

namespace App\Http\Controllers;

use App\Models\{Product, Report};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReportController extends Controller
{
    public function store(Request $request, int $id)
    {
        $v = Validator::make($request->all(), [
            'reason'      => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);
        if ($v->fails()) return response()->json(['errors' => $v->errors()], 422);

        $product = Product::findOrFail($id);
        $report = Report::firstOrCreate(
            ['product_id' => $id, 'reported_by' => $request->user()->id, 'status' => 'pending'],
            ['reason' => $request->reason, 'description' => $request->description]
        );

        return response()->json(['message' => 'Report submitted.'], 201);
    }
}
