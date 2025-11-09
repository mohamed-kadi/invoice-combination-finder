package com.invoicecombinationfinder.backend.service;

import com.invoicecombinationfinder.backend.dto.InvoiceInput;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class CombinationService {

        public CombinationResult findCombinations(BigDecimal target,
                                                 List<InvoiceInput> invoices,
                                                 CombinationFilters filters) {
                if (target == null) {
                        throw new IllegalArgumentException("Target amount is required.");
                }
                if (invoices == null) {
                        throw new IllegalArgumentException("Invoice list cannot be null.");
                }
                if (target.compareTo(BigDecimal.ZERO) <= 0) {
                        throw new IllegalArgumentException("Target amount must be greater than zero.");
                }

                CombinationFilters effectiveFilters = filters == null ? CombinationFilters.empty() : filters;
                Integer minInvoices = effectiveFilters.minInvoices();
                Integer maxInvoices = effectiveFilters.maxInvoices();

                if (minInvoices != null && minInvoices <= 0) {
                        throw new IllegalArgumentException("Minimum invoice count must be greater than zero.");
                }
                if (maxInvoices != null && maxInvoices <= 0) {
                        throw new IllegalArgumentException("Maximum invoice count must be greater than zero.");
                }
                if (minInvoices != null && maxInvoices != null && maxInvoices < minInvoices) {
                        throw new IllegalArgumentException("Maximum invoice count cannot be less than the minimum invoice count.");
                }

                List<InvoiceInput> sanitizedInvoices = invoices.stream()
                        .map(invoice -> {
                                if (invoice == null) {
                                        throw new IllegalArgumentException("Invoice entry cannot be null.");
                                }
                                BigDecimal amount = invoice.amount();
                                if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                                        throw new IllegalArgumentException("Invoice amounts must be greater than zero.");
                                }
                                String id = invoice.id();
                                if (id == null || id.isBlank()) {
                                        throw new IllegalArgumentException("Invoice id is required.");
                                }
                                return new InvoiceInput(id.trim(), amount);
                        })
                        .sorted(Comparator.comparing(InvoiceInput::amount).thenComparing(InvoiceInput::id))
                        .toList();

                if (sanitizedInvoices.isEmpty()) {
                        throw new IllegalArgumentException("Invoice list cannot be empty.");
                }

                Set<String> requiredInvoiceIds = effectiveFilters.requiredInvoiceIds();
                if (!requiredInvoiceIds.isEmpty()) {
                        Set<String> availableIds = sanitizedInvoices.stream()
                                .map(InvoiceInput::id)
                                .collect(java.util.stream.Collectors.toSet());
                        if (!availableIds.containsAll(requiredInvoiceIds)) {
                                throw new IllegalArgumentException("One or more required invoice ids are not present in the invoice list.");
                        }
                }

                int minimum = minInvoices != null ? minInvoices : 1;
                Integer maximum = maxInvoices;

                if (minimum > sanitizedInvoices.size()) {
                        Map<String, InvoiceInput> invoiceById = new LinkedHashMap<>();
                        sanitizedInvoices.forEach(invoice -> invoiceById.put(invoice.id(), invoice));
                        return new CombinationResult(List.of(), invoiceById);
                }

                List<List<String>> results = new ArrayList<>();
                backtrack(results,
                        new ArrayList<>(),
                        sanitizedInvoices,
                        target,
                        0,
                        minimum,
                        maximum,
                        requiredInvoiceIds);
                Map<String, InvoiceInput> invoiceById = new LinkedHashMap<>();
                sanitizedInvoices.forEach(invoice -> invoiceById.put(invoice.id(), invoice));
                return new CombinationResult(results, invoiceById);
        }

        private void backtrack(List<List<String>> results,
                               List<String> currentCombination,
                               List<InvoiceInput> invoices,
                               BigDecimal remaining,
                               int start,
                               int minInvoices,
                               Integer maxInvoices,
                               Set<String> requiredInvoiceIds) {
                if (remaining.compareTo(BigDecimal.ZERO) == 0) {
                        int size = currentCombination.size();
                        boolean meetsMin = size >= minInvoices;
                        boolean meetsMax = maxInvoices == null || size <= maxInvoices;
                        boolean containsRequired = requiredInvoiceIds.stream().allMatch(currentCombination::contains);
                        if (meetsMin && meetsMax && containsRequired) {
                                results.add(List.copyOf(currentCombination));
                        }
                        return;
                }

                if (maxInvoices != null && currentCombination.size() >= maxInvoices) {
                        return;
                }

                for (int i = start; i < invoices.size(); i++) {
                        InvoiceInput candidate = invoices.get(i);
                        BigDecimal amount = candidate.amount();

                        if (amount.compareTo(remaining) > 0) {
                                break;
                        }

                        currentCombination.add(candidate.id());
                        backtrack(results,
                                currentCombination,
                                invoices,
                                remaining.subtract(amount),
                                i + 1,
                                minInvoices,
                                maxInvoices,
                                requiredInvoiceIds);
                        currentCombination.remove(currentCombination.size() - 1);
                }
        }
}
