<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'email',
        'address',
        'emergency_contact',
        'notes',
    ];

    public function pets(): HasMany
    {
        return $this->hasMany(Pet::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class)->latest();
    }
}
