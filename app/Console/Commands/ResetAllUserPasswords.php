<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class ResetAllUserPasswords extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:reset-all-user-passwords';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Resetea la contraseña de todos los usuarios a "12345678"';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $users = User::all();
        $newPassword = '12345678';

        foreach ($users as $user) {
            $user->password = Hash::make($newPassword);
            $user->save();
            $this->info("Contraseña reseteada para el usuario: {$user->email}");
        }

        $this->info('¡Todas las contraseñas han sido reseteadas a "12345678" exitosamente!');
        return 0;
    }
}