<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id');
            $table->foreignId('reported_by')->constrained('users')->cascadeOnDelete();
            $table->string('reason');
            $table->text('description')->nullable();
            $table->enum('status', ['pending', 'ignored', 'resolved'])->default('pending');
            $table->timestamps();
            // soft-deleted products can still have reports; no FK constraint on product_id
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
