package com.invoicecombinationfinder.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.List;

public record CombinationRequest(
        @NotNull(message = "Target amount is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Target must be greater than zero")
        BigDecimal target,

        @NotEmpty(message = "At least one invoice is required")
        List<@Valid InvoiceInput> invoices,

        @Positive(message = "Minimum invoice count must be greater than zero")
        Integer minInvoices,

        @Positive(message = "Maximum invoice count must be greater than zero")
        Integer maxInvoices,

        List<@NotBlank(message = "Required invoice ids cannot be blank") String> requiredInvoiceIds
) {
}
