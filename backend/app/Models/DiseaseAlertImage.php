<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DiseaseAlertImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'disease_alert_id',
        'image_path',
        'caption'
    ];

    public function diseaseAlert()
    {
        return $this->belongsTo(DiseaseAlert::class);
    }
} 