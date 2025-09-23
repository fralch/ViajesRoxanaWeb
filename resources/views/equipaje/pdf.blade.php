<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Equipajes</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #007bff;
            padding-bottom: 15px;
        }
        
        .header h1 {
            color: #007bff;
            margin: 0;
            font-size: 24px;
        }
        
        .header p {
            margin: 5px 0;
            color: #666;
        }
        
        .hijo-section {
            margin-bottom: 40px;
            page-break-inside: avoid;
        }
        
        .hijo-header {
            background-color: #f8f9fa;
            padding: 10px;
            border-left: 4px solid #007bff;
            margin-bottom: 20px;
        }
        
        .hijo-header h2 {
            margin: 0;
            color: #007bff;
            font-size: 18px;
        }
        
        .hijo-info {
            margin: 5px 0;
            font-size: 11px;
            color: #666;
        }
        
        .equipaje-item {
            border: 1px solid #ddd;
            margin-bottom: 20px;
            padding: 15px;
            border-radius: 5px;
            page-break-inside: avoid;
        }
        
        .equipaje-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
        }
        
        .equipaje-id {
            font-weight: bold;
            color: #007bff;
            font-size: 14px;
        }
        
        .equipaje-dates {
            font-size: 10px;
            color: #666;
            text-align: right;
        }
        
        .equipaje-content {
            display: table;
            width: 100%;
        }
        
        .equipaje-info {
            display: table-cell;
            width: 60%;
            vertical-align: top;
            padding-right: 20px;
        }
        
        .equipaje-images {
            display: table-cell;
            width: 40%;
            vertical-align: top;
        }
        
        .info-row {
            margin-bottom: 8px;
        }
        
        .info-label {
            font-weight: bold;
            color: #555;
            display: inline-block;
            width: 120px;
        }
        
        .info-value {
            color: #333;
        }
        
        .caracteristicas {
            background-color: #f8f9fa;
            padding: 8px;
            border-radius: 3px;
            margin-top: 10px;
        }
        
        .caracteristicas-title {
            font-weight: bold;
            color: #555;
            margin-bottom: 5px;
        }
        
        .image-container {
            text-align: center;
            margin-bottom: 10px;
        }
        
        .equipaje-image {
            max-width: 150px;
            max-height: 150px;
            border: 1px solid #ddd;
            border-radius: 3px;
            margin: 2px;
        }
        
        .image-label {
            font-size: 10px;
            color: #666;
            margin-top: 3px;
        }
        
        .no-equipajes {
            text-align: center;
            color: #666;
            font-style: italic;
            padding: 20px;
        }
        
        .footer {
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        
        @page {
            margin: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Reporte de Equipajes</h1>
        <p><strong>Usuario:</strong> {{ $user->name }}</p>
        @if($selectedHijo)
            <p><strong>Hijo:</strong> {{ $selectedHijo->nombres }} {{ $selectedHijo->apellidos }} ({{ $selectedHijo->doc_numero }})</p>
        @else
            <p><strong>Todos los hijos</strong></p>
        @endif
        <p><strong>Fecha de generación:</strong> {{ $fecha_generacion }}</p>
    </div>

    @foreach($hijos as $hijo)
        <div class="hijo-section">
            <div class="hijo-header">
                <h2>{{ $hijo->nombres }} {{ $hijo->apellidos }}</h2>
                <div class="hijo-info">
                    <strong>Documento:</strong> {{ $hijo->doc_numero }} | 
                    <strong>Teléfono:</strong> {{ $hijo->telefono }} | 
                    <strong>Email:</strong> {{ $hijo->email }}
                </div>
            </div>

            @if($hijo->equipajes->count() > 0)
                @foreach($hijo->equipajes as $equipaje)
                    <div class="equipaje-item">
                        <div class="equipaje-header">
                            <div class="equipaje-id">Equipaje #{{ $equipaje->id }}</div>
                            <div class="equipaje-dates">
                                <div><strong>Creado:</strong> {{ $equipaje->created_at->format('d/m/Y H:i') }}</div>
                                @if($equipaje->updated_at->format('Y-m-d H:i') !== $equipaje->created_at->format('Y-m-d H:i'))
                                    <div><strong>Actualizado:</strong> {{ $equipaje->updated_at->format('d/m/Y H:i') }}</div>
                                @endif
                            </div>
                        </div>

                        <div class="equipaje-content">
                            <div class="equipaje-info">
                                <div class="info-row">
                                    <span class="info-label">Tipo de Maleta:</span>
                                    <span class="info-value">{{ $equipaje->tip_maleta }}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Número Etiqueta:</span>
                                    <span class="info-value">{{ $equipaje->num_etiqueta }}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Color:</span>
                                    <span class="info-value">{{ $equipaje->color }}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Peso:</span>
                                    <span class="info-value">{{ $equipaje->peso }} kg</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Lugar Registro:</span>
                                    <span class="info-value">{{ $equipaje->lugar_regis }}</span>
                                </div>

                                @if($equipaje->caracteristicas)
                                    <div class="caracteristicas">
                                        <div class="caracteristicas-title">Características:</div>
                                        <div>{{ $equipaje->caracteristicas }}</div>
                                    </div>
                                @endif
                            </div>

                            <div class="equipaje-images">
                                @php
                                    $images = [];
                                    if($equipaje->images) $images[] = ['path' => $equipaje->images, 'label' => 'Imagen Principal'];
                                    if($equipaje->images1) $images[] = ['path' => $equipaje->images1, 'label' => 'Imagen 2'];
                                    if($equipaje->images2) $images[] = ['path' => $equipaje->images2, 'label' => 'Imagen 3'];
                                @endphp

                                @if(count($images) > 0)
                                    @foreach($images as $image)
                                        <div class="image-container">
                                            @if(file_exists(public_path($image['path'])))
                                                <img src="{{ asset($image['path']) }}" alt="{{ $image['label'] }}" class="equipaje-image">
                                                <div class="image-label">{{ $image['label'] }}</div>
                                            @else
                                                <div style="width: 150px; height: 100px; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; color: #999; font-size: 10px;">
                                                    Imagen no disponible
                                                </div>
                                                <div class="image-label">{{ $image['label'] }}</div>
                                            @endif
                                        </div>
                                    @endforeach
                                @else
                                    <div style="text-align: center; color: #999; font-style: italic; font-size: 11px;">
                                        Sin imágenes
                                    </div>
                                @endif
                            </div>
                        </div>
                    </div>
                @endforeach
            @else
                <div class="no-equipajes">
                    No hay equipajes registrados para este hijo.
                </div>
            @endif
        </div>
    @endforeach

    <div class="footer">
        <p>Reporte generado el {{ $fecha_generacion }} | Viajes Roxana - Sistema de Gestión de Equipajes</p>
    </div>
</body>
</html>