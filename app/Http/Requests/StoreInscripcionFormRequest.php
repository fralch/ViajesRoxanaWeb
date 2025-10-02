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
        \Log::info('=== FORM REQUEST VALIDATION START ===');
        \Log::info('Request data in FormRequest:', $this->all());
        \Log::info('Has assign_guardian?', ['has_assign_guardian' => $this->has('assign_guardian')]);
        \Log::info('assign_guardian value:', ['assign_guardian' => $this->assign_guardian]);

        // If this is just a guardian assignment/confirmation request
        if ($this->has('assign_guardian') && $this->assign_guardian) {
            \Log::info('Processing guardian assignment validation rules');

            // If linking existing guardian, only validate the guardian ID (NO other validations)
            if ($this->has('link_existing_guardian') && $this->link_existing_guardian) {
                \Log::info('Linking existing guardian - minimal validation (only ID required)');
                return [
                    'selected_child_id' => 'required|integer',
                    'assign_guardian' => 'required|boolean',
                    'link_existing_guardian' => 'required|boolean',
                    'existing_guardian_id' => 'required|integer|exists:users,id',
                ];
            }

            // If confirming existing guardian, don't validate parent/children data
            if ($this->has('confirm_existing_guardian') && $this->confirm_existing_guardian) {
                \Log::info('Confirming existing guardian - minimal validation');
                return [
                    'selected_child_id' => 'required|integer',
                    'assign_guardian' => 'required|boolean',
                    'confirm_existing_guardian' => 'required|boolean',
                ];
            }

            // If creating new user, validate parent data only
            if ($this->has('user_creation_mode') && $this->user_creation_mode) {
                \Log::info('User creation mode - validating parent data');
                return [
                    'selected_child_id' => 'required|integer',
                    'assign_guardian' => 'required|boolean',
                    'user_creation_mode' => 'required|boolean',
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
                ];
            }

            // Default guardian assignment rules (fallback)
            return [
                'selected_child_id' => 'required|integer',
                'assign_guardian' => 'required|boolean',
            ];
        }

        // Regular inscription validation (original behavior)
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
                'regex:/^9\d{8}$/',
                'unique:users,phone'
            ],
            'parent_email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email'
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
            'parent_phone.unique' => 'Este número de celular ya está registrado.',
            'parent_email.required' => 'El correo electrónico es obligatorio.',
            'parent_email.email' => 'El correo electrónico debe tener un formato válido.',
            'parent_email.unique' => 'Este correo electrónico ya está registrado.',
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
