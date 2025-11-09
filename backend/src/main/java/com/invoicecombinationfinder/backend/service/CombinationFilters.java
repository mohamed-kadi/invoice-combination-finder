package com.invoicecombinationfinder.backend.service;

import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Objects;
import java.util.Set;

public record CombinationFilters(
        Integer minInvoices,
        Integer maxInvoices,
        Set<String> requiredInvoiceIds
) {
        public CombinationFilters {
                Set<String> sanitized = requiredInvoiceIds == null
                        ? Collections.emptySet()
                        : requiredInvoiceIds.stream()
                        .filter(Objects::nonNull)
                        .map(String::trim)
                        .filter(value -> !value.isEmpty())
                        .collect(LinkedHashSet::new, LinkedHashSet::add, LinkedHashSet::addAll);
                requiredInvoiceIds = Collections.unmodifiableSet(sanitized);
        }

        public static CombinationFilters empty() {
                return new CombinationFilters(null, null, Collections.emptySet());
        }
}
