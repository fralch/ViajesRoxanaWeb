<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Jobs\MigrateGeolocalizacionToDatabase;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule geolocation data migration at 3am Peru time daily
Schedule::job(new MigrateGeolocalizacionToDatabase())
    ->dailyAt('03:00')
    ->timezone('America/Lima')
    ->name('migrate-geolocation-data')
    ->withoutOverlapping()
    ->onOneServer();
