package com.invoicecombinationfinder.backend.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record CombinationResponse(
        List<List<String>> combinations,
        int combinationCount,
        Map<String, BigDecimal> invoiceAmounts
) {
        public CombinationResponse(List<List<String>> combinations, Map<String, BigDecimal> invoiceAmounts) {
                this(combinations, combinations.size(), invoiceAmounts);
        }
}
