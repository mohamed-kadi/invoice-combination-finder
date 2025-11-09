package com.invoicecombinationfinder.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record InvoiceInput(
        @NotBlank(message = "Invoice id is required")
        String id,

        @NotNull(message = "Invoice amount is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Invoice amounts must be greater than zero")
        BigDecimal amount
) {
}
