<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(Category::orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|max:100|unique:categories,name']);
        $category = Category::create(['name' => $request->name]);
        return response()->json($category, 201);
    }

    public function update(Request $request, int $id)
    {
        $category = Category::findOrFail($id);
        $request->validate(['name' => 'required|string|max:100|unique:categories,name,' . $id]);
        $category->update(['name' => $request->name]);
        return response()->json($category);
    }

    public function destroy(int $id)
    {
        $category = Category::findOrFail($id);
        $category->delete();
        return response()->json(['message' => 'Deleted.']);
    }
}
