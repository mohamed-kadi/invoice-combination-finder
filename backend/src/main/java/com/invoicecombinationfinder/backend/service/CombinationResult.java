package com.invoicecombinationfinder.backend.service;

import com.invoicecombinationfinder.backend.dto.InvoiceInput;

import java.util.List;
import java.util.Map;

public record CombinationResult(
        List<List<String>> combinations,
        Map<String, InvoiceInput> invoiceById
) {
}
