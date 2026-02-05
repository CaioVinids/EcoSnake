import React from 'react';

const EmailInput = ({
    id,
    label,
    value,
    onChange,
    name = "email",
    placeholder = "Digite seu e-mail",
    required = false,
    disabled = false,
    className = "form-control",
    labelClassName = "form-label",
    containerClassName = "mb-3",
    autoComplete = "email"
}) => {
    return (
        <div className={containerClassName}>
            {label && (
                <label htmlFor={id} className={labelClassName}>
                    {label}
                </label>
            )}
            <input
                type="email"
                id={id}
                name={name}
                className={className}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                autoComplete={autoComplete}
            />
        </div>
    );
};

export default EmailInput;