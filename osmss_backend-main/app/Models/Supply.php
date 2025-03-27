<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Supply extends Model
{
    
    protected $fillable = [
        'name',
        'pieces',
        'box',
        'unit',
        'status',
    ];
}
