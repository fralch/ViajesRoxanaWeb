<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    public static function enviarWhatsApp($phone, $name, $password)
    {
        try {
            Log::info("Iniciando envío de WhatsApp", [
                'phone' => $phone,
                'name' => $name,
                'timestamp' => now()
            ]);

            $mensaje = "Viajes Roxana – Intranet de Padres\n\n";
            $mensaje .= "👋 ¡Bienvenido!\n\n";
            $mensaje .= "👤 Usuario: {$name}\n";
            $mensaje .= "🔐 Contraseña: {$password}\n\n";
            $mensaje .= "📲 Ingresa aquí : https://grupoviajesroxana.com \n\n";
            $mensaje .= "👉 Con tu cuenta podrás:\n\n";
            $mensaje .= "Ver la información y el itinerario de tu hijo.\n";
            $mensaje .= "* Acceder a comunicados y novedades del viaje.\n";
            $mensaje .= "* Registrar tus datos de contacto para recibir notificaciones en tiempo real durante el viaje.\n";
            $mensaje .= "* La intranet es tu canal oficial para mantenerte informado y seguro.\n";
            $mensaje .= "Si tienes dudas, contáctanos. Estamos para ti. 🤝";
            
            $curl = curl_init();
            $phoneWithCode = '51' . $phone;
            
            $instanceId = config('services.whatsapp.instance_id', 'NTE5NjExMTQ0MDQ=');
            $apiUrl = "https://apiwsp.factiliza.com/v1/message/sendtext/{$instanceId}";
            
            Log::info("Preparando request de WhatsApp", [
                'phone_formatted' => $phoneWithCode,
                'message_length' => strlen($mensaje),
                'api_url' => $apiUrl
            ]);
            
            curl_setopt_array($curl, [
                CURLOPT_URL => $apiUrl,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => "",
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 60,
                CURLOPT_CONNECTTIMEOUT => 30,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => "POST",
                CURLOPT_POSTFIELDS => json_encode([
                    'number' => $phoneWithCode,
                    'text' => $mensaje
                ]),
                CURLOPT_HTTPHEADER => [
                    "Authorization: Bearer " . config('services.whatsapp.token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzOTM1NCIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6ImNvbnN1bHRvciJ9.MrhLuClAq-NTpvXx_72Zw9kTOIEqMiSRWVzPfeF64Xg'),
                    "Content-Type: application/json"
                ],
                // Configuraciones SSL para producción
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_SSL_VERIFYHOST => false,
                CURLOPT_SSLVERSION => CURL_SSLVERSION_DEFAULT,
                CURLOPT_USERAGENT => "ViajesRoxana/1.0",
                CURLOPT_FRESH_CONNECT => true,
                CURLOPT_FORBID_REUSE => true,
            ]);

            $response = curl_exec($curl);
            $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
            $err = curl_error($curl);
            
            curl_close($curl);

            Log::info("Respuesta de API WhatsApp", [
                'http_code' => $httpCode,
                'response' => $response,
                'phone' => $phoneWithCode
            ]);

            if ($err) {
                Log::error("Error cURL enviando WhatsApp", [
                    'error' => $err,
                    'phone' => $phoneWithCode,
                    'name' => $name
                ]);
                return false;
            }

            $responseData = json_decode($response, true);
            
            if ($httpCode >= 200 && $httpCode < 300) {
                Log::info("WhatsApp enviado exitosamente", [
                    'phone' => $phoneWithCode,
                    'name' => $name,
                    'response_data' => $responseData,
                    'timestamp' => now()
                ]);
                return true;
            } else {
                Log::error("Error en respuesta de API WhatsApp", [
                    'http_code' => $httpCode,
                    'response' => $response,
                    'phone' => $phoneWithCode,
                    'name' => $name
                ]);
                return false;
            }
            
        } catch (\Exception $e) {
            Log::error("Excepción enviando WhatsApp", [
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'phone' => $phone,
                'name' => $name,
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);
            return false;
        }
    }

    public static function enviarMensajeTrazabilidad($phone, $mensaje)
    {
        try {
            Log::info("Iniciando envío de WhatsApp trazabilidad", [
                'phone' => $phone,
                'timestamp' => now()
            ]);
            
            $curl = curl_init();
            $phoneWithCode = '51' . $phone;
            
            $instanceId = config('services.whatsapp.instance_id', 'NTE5NjExMTQ0MDQ=');
            $apiUrl = "https://apiwsp.factiliza.com/v1/message/sendtext/{$instanceId}";
            
            Log::info("Preparando request de WhatsApp trazabilidad", [
                'phone_formatted' => $phoneWithCode,
                'message_length' => strlen($mensaje),
                'api_url' => $apiUrl
            ]);
            
            curl_setopt_array($curl, [
                CURLOPT_URL => $apiUrl,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => "",
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 60,
                CURLOPT_CONNECTTIMEOUT => 30,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => "POST",
                CURLOPT_POSTFIELDS => json_encode([
                    'number' => $phoneWithCode,
                    'text' => $mensaje
                ]),
                CURLOPT_HTTPHEADER => [
                    "Authorization: Bearer " . config('services.whatsapp.token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzOTM1NCIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6ImNvbnN1bHRvciJ9.MrhLuClAq-NTpvXx_72Zw9kTOIEqMiSRWVzPfeF64Xg'),
                    "Content-Type: application/json"
                ],
                // Configuraciones SSL para producción
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_SSL_VERIFYHOST => false,
                CURLOPT_SSLVERSION => CURL_SSLVERSION_DEFAULT,
                CURLOPT_USERAGENT => "ViajesRoxana/1.0",
                CURLOPT_FRESH_CONNECT => true,
                CURLOPT_FORBID_REUSE => true,
            ]);

            $response = curl_exec($curl);
            $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
            $err = curl_error($curl);
            
            curl_close($curl);

            Log::info("Respuesta de API WhatsApp trazabilidad", [
                'http_code' => $httpCode,
                'response' => $response,
                'phone' => $phoneWithCode
            ]);

            if ($err) {
                Log::error("Error cURL enviando WhatsApp trazabilidad", [
                    'error' => $err,
                    'phone' => $phoneWithCode
                ]);
                return false;
            }

            $responseData = json_decode($response, true);
            
            if ($httpCode >= 200 && $httpCode < 300) {
                Log::info("WhatsApp trazabilidad enviado exitosamente", [
                    'phone' => $phoneWithCode,
                    'response_data' => $responseData,
                    'timestamp' => now()
                ]);
                return true;
            } else {
                Log::error("Error en respuesta de API WhatsApp trazabilidad", [
                    'http_code' => $httpCode,
                    'response' => $response,
                    'phone' => $phoneWithCode
                ]);
                return false;
            }
            
        } catch (\Exception $e) {
            Log::error("Excepción enviando WhatsApp trazabilidad", [
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'phone' => $phone,
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);
            return false;
        }
    }
}