<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\WhatsAppService;
use Inertia\Inertia;

class SendMessageController extends Controller
{
    public function bulkMessage()
    {
        return Inertia::render('sendmessage/BulkMessage');
    }

    public function sendBulkMessage(Request $request)
    {
        $request->validate([
            'phones' => 'required|string',
            'message' => 'required|string|max:1000'
        ]);

        $phonesInput = $request->input('phones');
        $message = $request->input('message');

        // Parse phone numbers (remove spaces and split by comma)
        $phoneNumbers = array_filter(array_map('trim', explode(',', $phonesInput)));
        
        $results = [];
        $successCount = 0;
        $failureCount = 0;

        foreach ($phoneNumbers as $phone) {
            // Clean phone number (remove any non-digits)
            $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
            
            if (strlen($cleanPhone) >= 9) {
                $success = WhatsAppService::enviarMensajeTrazabilidad($cleanPhone, $message);
                
                $results[] = [
                    'phone' => $phone,
                    'success' => $success,
                    'message' => $success ? 'Enviado correctamente' : 'Error al enviar'
                ];

                if ($success) {
                    $successCount++;
                } else {
                    $failureCount++;
                }

                // Small delay between messages to avoid overwhelming the API
                sleep(1);
            } else {
                $results[] = [
                    'phone' => $phone,
                    'success' => false,
                    'message' => 'Número de teléfono inválido'
                ];
                $failureCount++;
            }
        }

        return back()->with([
            'success' => true,
            'results' => $results,
            'summary' => [
                'total' => count($phoneNumbers),
                'success' => $successCount,
                'failure' => $failureCount
            ]
        ]);
    }
}