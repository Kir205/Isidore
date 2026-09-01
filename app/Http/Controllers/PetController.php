<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Pet;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PetController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'name' => 'required|string|max:255',
            'species' => 'required|string|max:100',
            'breed' => 'nullable|string|max:100',
            'gender' => 'required|string|in:Male,Female,Neutered Male,Spayed Female,Unknown',
            'weight_kg' => 'nullable|numeric|min:0',
            'date_of_birth' => 'nullable|date',
            'microchip_number' => 'nullable|string|max:100',
            'medical_notes' => 'nullable|string',
            'allergies' => 'nullable|string',
        ]);

        $pet = Pet::create($validated);

        return redirect()->back()->with('success', "Pet \"{$pet->name}\" added to patient list!");
    }

    public function update(Request $request, Pet $pet): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'species' => 'required|string|max:100',
            'breed' => 'nullable|string|max:100',
            'gender' => 'required|string|in:Male,Female,Neutered Male,Spayed Female,Unknown',
            'weight_kg' => 'nullable|numeric|min:0',
            'date_of_birth' => 'nullable|date',
            'microchip_number' => 'nullable|string|max:100',
            'medical_notes' => 'nullable|string',
            'allergies' => 'nullable|string',
        ]);

        $pet->update($validated);

        return redirect()->back()->with('success', "Pet profile for \"{$pet->name}\" updated successfully!");
    }

    public function destroy(Pet $pet): RedirectResponse
    {
        $name = $pet->name;
        $pet->delete();

        return redirect()->back()->with('success', "Pet \"{$name}\" removed from records.");
    }
}
