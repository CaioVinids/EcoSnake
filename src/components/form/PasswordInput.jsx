import React from 'react';

const PasswordInput = ({
    id,
    label,
    value,
    onChange,
    name = "password",
    placeholder = "Digite sua senha",
    required = false,
    disabled = false,
    className = "form-control",
    labelClassName = "form-label",
    containerClassName = "mb-3",
    autoComplete = "current-password"
}) => {
    return (
        <div className={containerClassName}>
            {label && (
                <label htmlFor={id} className={labelClassName}>
                    {label}
                </label>
            )}
            <input
                type="password"
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

export default PasswordInput;