<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupplyHistory extends Model
{
    //
    protected $fillable = [
        'name',
        'pieces',
        'releaser',
        'reason',
        'action',
    ];
}
