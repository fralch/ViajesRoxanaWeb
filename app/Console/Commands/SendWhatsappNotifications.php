<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Notificacion;
use Twilio\Rest\Client;

class SendWhatsappNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-whatsapp-notifications';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send pending WhatsApp notifications';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Sending pending WhatsApp notifications...');

        $pendingNotifications = Notificacion::where('estado', 'pendiente')->get();

        if ($pendingNotifications->isEmpty()) {
            $this->info('No pending notifications to send.');
            return;
        }

        $twilioSid = env('TWILIO_SID');
        $twilioAuthToken = env('TWILIO_AUTH_TOKEN');
        $twilioWhatsappFrom = env('TWILIO_WHATSAPP_FROM');

        if (!$twilioSid || !$twilioAuthToken || !$twilioWhatsappFrom) {
            $this->error('Twilio credentials are not configured in your .env file.');
            return;
        }

        $twilio = new Client($twilioSid, $twilioAuthToken);

        foreach ($pendingNotifications as $notification) {
            try {
                $twilio->messages->create(
                    'whatsapp:' . $notification->celular,
                    [
                        'from' => 'whatsapp:' . $twilioWhatsappFrom,
                        'body' => $notification->mensaje,
                    ]
                );

                $notification->update(['estado' => 'enviado']);
                $this->info('Notification sent to ' . $notification->celular);
            } catch (\Exception $e) {
                $this->error('Error sending notification to ' . $notification->celular . ': ' . $e->getMessage());
                $notification->update(['estado' => 'fallo']);
            }
        }

        $this->info('Finished sending notifications.');
    }
}
