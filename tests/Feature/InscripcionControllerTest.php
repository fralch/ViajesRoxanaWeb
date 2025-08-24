<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Paquete;
use App\Models\Grupo;
use App\Models\Hijo;
use App\Models\Inscripcion;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use App\Http\Controllers\InscripcionController;

class InscripcionControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test del envío de WhatsApp con logging
     */
    public function test_envio_whatsapp_con_logging()
    {
        // Arrange
        Log::fake();
        
        // Crear un usuario de prueba
        $user = User::factory()->create([
            'name' => 'Juan Pérez',
            'dni' => '12345678',
            'phone' => '987654321',
            'is_admin' => true
        ]);
        
        // Crear paquete y grupo de prueba
        $paquete = Paquete::create([
            'nombre' => 'Paquete Test',
            'descripcion' => 'Descripción test',
            'precio' => 500,
            'destino' => 'Lima',
            'activo' => true
        ]);
        
        $grupo = Grupo::create([
            'nombre' => 'Grupo Test',
            'paquete_id' => $paquete->id,
            'capacidad' => 10,
            'activo' => true
        ]);
        
        // Simular respuesta exitosa de la API de WhatsApp
        Http::fake([
            'api.factiliza.com/*' => Http::response([
                'status' => 'success',
                'message' => 'WhatsApp sent successfully'
            ], 200)
        ]);
        
        // Act - Realizar inscripción que debería enviar WhatsApp
        $response = $this->actingAs($user)
            ->post(route('inscripcion.store', [$paquete->id, $grupo->id]), [
                'parent_name' => 'María González',
                'parent_email' => 'maria@test.com',
                'parent_phone' => '999888777',
                'parent_dni' => '87654321',
                'children' => [
                    [
                        'name' => 'Pedro González',
                        'docType' => 'DNI',
                        'docNumber' => '12341234'
                    ]
                ]
            ]);
        
        // Assert - Verificar logs
        Log::assertLogged('info', function ($message, $context) {
            return $message === 'Iniciando envío de WhatsApp' &&
                   $context['phone'] === '999888777' &&
                   $context['name'] === 'María González';
        });
        
        Log::assertLogged('info', function ($message, $context) {
            return $message === 'Preparando request de WhatsApp' &&
                   $context['phone_formatted'] === '51999888777';
        });
    }

    /**
     * Test de error en envío de WhatsApp
     */
    public function test_error_envio_whatsapp_logging()
    {
        // Arrange
        Log::fake();
        
        $user = User::factory()->create(['is_admin' => true]);
        
        $paquete = Paquete::create([
            'nombre' => 'Paquete Test',
            'descripcion' => 'Descripción test',
            'precio' => 500,
            'destino' => 'Lima',
            'activo' => true
        ]);
        
        $grupo = Grupo::create([
            'nombre' => 'Grupo Test',
            'paquete_id' => $paquete->id,
            'capacidad' => 10,
            'activo' => true
        ]);
        
        // Simular error en la API
        Http::fake([
            'api.factiliza.com/*' => Http::response([
                'error' => 'API Error'
            ], 500)
        ]);
        
        // Act
        $response = $this->actingAs($user)
            ->post(route('inscripcion.store', [$paquete->id, $grupo->id]), [
                'parent_name' => 'Carlos Ruiz',
                'parent_email' => 'carlos@test.com',
                'parent_phone' => '555666777',
                'parent_dni' => '11223344',
                'children' => [
                    [
                        'name' => 'Ana Ruiz',
                        'docType' => 'DNI',
                        'docNumber' => '55556666'
                    ]
                ]
            ]);
        
        // Assert - Verificar logs de error
        Log::assertLogged('error', function ($message, $context) {
            return $message === 'Error en respuesta de API WhatsApp' &&
                   $context['http_code'] === 500 &&
                   $context['phone'] === '51555666777';
        });
    }

    /**
     * Test manual del método enviarWhatsApp
     */
    public function test_enviar_whatsapp_metodo_directo()
    {
        // Arrange
        Log::fake();
        
        $controller = new InscripcionController();
        
        // Usar reflection para acceder al método privado
        $reflection = new \ReflectionClass($controller);
        $method = $reflection->getMethod('enviarWhatsApp');
        $method->setAccessible(true);
        
        // Simular respuesta exitosa
        Http::fake([
            'api.factiliza.com/*' => Http::response([
                'status' => 'success',
                'id' => '123456'
            ], 200)
        ]);
        
        // Act
        $result = $method->invoke($controller, '987654321', 'Test User', 'testpass123');
        
        // Assert
        $this->assertTrue($result);
        
        // Verificar logs específicos
        Log::assertLogged('info', function ($message, $context) {
            return $message === 'Iniciando envío de WhatsApp' &&
                   $context['phone'] === '987654321' &&
                   $context['name'] === 'Test User';
        });
        
        Log::assertLogged('info', function ($message, $context) {
            return $message === 'WhatsApp enviado exitosamente' &&
                   $context['phone'] === '51987654321' &&
                   $context['name'] === 'Test User';
        });
    }

    /**
     * Test para verificar formato del mensaje
     */
    public function test_formato_mensaje_whatsapp()
    {
        // Arrange
        Http::fake(function ($request) {
            $data = json_decode($request->body(), true);
            
            // Verificar que el mensaje contiene las credenciales
            $this->assertStringContainsString('Test User', $data['message']);
            $this->assertStringContainsString('testpass123', $data['message']);
            $this->assertStringContainsString('https://grupoviajesroxana.com/', $data['message']);
            $this->assertEquals('51987654321', $data['phone']);
            
            return Http::response(['status' => 'success'], 200);
        });
        
        $controller = new InscripcionController();
        $reflection = new \ReflectionClass($controller);
        $method = $reflection->getMethod('enviarWhatsApp');
        $method->setAccessible(true);
        
        // Act
        $result = $method->invoke($controller, '987654321', 'Test User', 'testpass123');
        
        // Assert
        $this->assertTrue($result);
    }

    /**
     * Test de configuración desde archivo config
     */
    public function test_configuracion_whatsapp_desde_config()
    {
        // Arrange
        config(['services.whatsapp.api_url' => 'https://custom-api.com/send']);
        config(['services.whatsapp.token' => 'custom-token-123']);
        
        Http::fake(function ($request) {
            // Verificar que usa la URL personalizada
            $this->assertEquals('https://custom-api.com/send', $request->url());
            
            // Verificar que usa el token personalizado
            $authHeader = $request->header('Authorization');
            $this->assertStringContainsString('custom-token-123', $authHeader[0]);
            
            return Http::response(['status' => 'success'], 200);
        });
        
        $controller = new InscripcionController();
        $reflection = new \ReflectionClass($controller);
        $method = $reflection->getMethod('enviarWhatsApp');
        $method->setAccessible(true);
        
        // Act
        $result = $method->invoke($controller, '987654321', 'Test User', 'testpass123');
        
        // Assert
        $this->assertTrue($result);
    }
}