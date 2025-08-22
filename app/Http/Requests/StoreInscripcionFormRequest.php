<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInscripcionFormRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'parent_name' => [
                'required',
                'string',
                'max:255',
                'min:3',
                'regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/'
            ],
            'parent_phone' => [
                'required',
                'string',
                'regex:/^9\d{8}$/'
            ],
            'parent_email' => [
                'required',
                'email',
                'max:255'
            ],
            'parent_dni' => [
                'required',
                'string',
                'regex:/^\d{8}$/'
            ],
            'children' => [
                'required',
                'array',
                'min:1',
                'max:5'
            ],
            'children.*.name' => [
                'required',
                'string',
                'max:255',
                'min:3',
                'regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/'
            ],
            'children.*.docType' => [
                'required',
                'string',
                'in:DNI,Pasaporte,C. E.'
            ],
            'children.*.docNumber' => [
                'required',
                'string',
                'max:20',
                'min:8'
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'parent_name.required' => 'El nombre del tutor es obligatorio.',
            'parent_name.min' => 'El nombre del tutor debe tener al menos 3 caracteres.',
            'parent_name.regex' => 'El nombre del tutor solo puede contener letras y espacios.',
            'parent_phone.required' => 'El celular es obligatorio.',
            'parent_phone.regex' => 'El celular debe ser un número peruano válido (9 dígitos empezando en 9).',
            'parent_email.required' => 'El correo electrónico es obligatorio.',
            'parent_email.email' => 'El correo electrónico debe tener un formato válido.',
            'parent_dni.required' => 'El DNI es obligatorio.',
            'parent_dni.regex' => 'El DNI debe tener exactamente 8 dígitos.',
            'children.required' => 'Debe registrar al menos un hijo.',
            'children.min' => 'Debe registrar al menos un hijo.',
            'children.max' => 'No puede registrar más de 5 hijos a la vez.',
            'children.*.name.required' => 'El nombre del hijo es obligatorio.',
            'children.*.name.min' => 'El nombre del hijo debe tener al menos 3 caracteres.',
            'children.*.name.regex' => 'El nombre del hijo solo puede contener letras y espacios.',
            'children.*.docType.required' => 'El tipo de documento es obligatorio.',
            'children.*.docType.in' => 'El tipo de documento debe ser DNI, Pasaporte o C. E.',
            'children.*.docNumber.required' => 'El número de documento es obligatorio.',
            'children.*.docNumber.min' => 'El número de documento debe tener al menos 8 caracteres.',
            'children.*.docNumber.max' => 'El número de documento no puede tener más de 20 caracteres.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'parent_name' => 'nombre del tutor',
            'parent_phone' => 'celular',
            'parent_email' => 'correo electrónico',
            'parent_dni' => 'DNI',
            'children.*.name' => 'nombre del hijo',
            'children.*.docType' => 'tipo de documento',
            'children.*.docNumber' => 'número de documento',
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        if ($this->expectsJson()) {
            parent::failedValidation($validator);
        }

        // Para requests de Inertia, redirigir con errores
        throw new \Illuminate\Validation\ValidationException($validator, 
            redirect()->back()
                ->withInput($this->except(['children']))
                ->withErrors($validator->errors())
        );
    }
}
