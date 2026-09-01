<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone');
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->string('emergency_contact')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('pets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->string('name');
            $table->string('species')->default('Dog'); // Dog, Cat, Bird, Rabbit, etc.
            $table->string('breed')->nullable();
            $table->string('gender')->default('Male'); // Male, Female, Neutered Male, Spayed Female
            $table->date('date_of_birth')->nullable();
            $table->decimal('weight_kg', 6, 2)->nullable();
            $table->string('microchip_number')->nullable();
            $table->text('medical_notes')->nullable();
            $table->text('allergies')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pets');
        Schema::dropIfExists('customers');
    }
};
