<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('item_history', function (Blueprint $table) {
            $table->id();
            $table->string("name");
            $table->integer("pieces");
            $table->string("releaser");
            $table->string("reason");
            $table->string("action");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('item_history');
    }
};
