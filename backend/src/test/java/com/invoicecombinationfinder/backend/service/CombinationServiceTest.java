package com.invoicecombinationfinder.backend.service;

import com.invoicecombinationfinder.backend.dto.InvoiceInput;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class CombinationServiceTest {

        private final CombinationService combinationService = new CombinationService();

        @Test
        void findsAllUniqueCombinationsOfIds() {
                BigDecimal target = new BigDecimal("15");
                List<InvoiceInput> invoices = List.of(
                        invoice("INV-100", "10"),
                        invoice("INV-200", "5"),
                        invoice("INV-300", "7"),
                        invoice("INV-400", "8")
                );

                CombinationResult result = combinationService.findCombinations(target, invoices, CombinationFilters.empty());
                List<List<String>> combinations = result.combinations();

                assertEquals(2, combinations.size());
                assertEquals(List.of("INV-200", "INV-100"), combinations.get(0));
                assertEquals(List.of("INV-300", "INV-400"), combinations.get(1));
                assertEquals(new BigDecimal("10"), result.invoiceById().get("INV-100").amount());
        }

        @Test
        void includesDifferentInvoicesWithSameAmount() {
                BigDecimal target = new BigDecimal("20");
                List<InvoiceInput> invoices = List.of(
                        invoice("INV-A1", "10"),
                        invoice("INV-A2", "10"),
                        invoice("INV-B1", "5"),
                        invoice("INV-B2", "5")
                );

                CombinationResult result = combinationService.findCombinations(target, invoices, CombinationFilters.empty());
                List<List<String>> combinations = result.combinations();

                assertEquals(3, combinations.size());
                assertEquals(List.of("INV-B1", "INV-B2", "INV-A1"), combinations.get(0));
                assertEquals(List.of("INV-B1", "INV-B2", "INV-A2"), combinations.get(1));
                assertEquals(List.of("INV-A1", "INV-A2"), combinations.get(2));
        }

        @Test
        void returnsEmptyListWhenNoCombinationMatches() {
                BigDecimal target = new BigDecimal("50");
                List<InvoiceInput> invoices = List.of(
                        invoice("INV-1", "10"),
                        invoice("INV-2", "15"),
                        invoice("INV-3", "20")
                );

                CombinationResult result = combinationService.findCombinations(target, invoices, CombinationFilters.empty());
                List<List<String>> combinations = result.combinations();

                assertEquals(0, combinations.size());
        }

        @Test
        void throwsWhenTargetIsNotPositive() {
                BigDecimal target = new BigDecimal("0");
                List<InvoiceInput> invoices = List.of(invoice("INV-1", "10"));

                IllegalArgumentException exception = assertThrows(
                        IllegalArgumentException.class,
                        () -> combinationService.findCombinations(target, invoices, CombinationFilters.empty())
                );

                assertEquals("Target amount must be greater than zero.", exception.getMessage());
        }

        @Test
        void throwsWhenInvoiceHasNonPositiveValue() {
                BigDecimal target = new BigDecimal("10");
                List<InvoiceInput> invoices = List.of(invoice("INV-1", "10"), invoice("INV-2", "-1"));

                IllegalArgumentException exception = assertThrows(
                        IllegalArgumentException.class,
                        () -> combinationService.findCombinations(target, invoices, CombinationFilters.empty())
                );

                assertEquals("Invoice amounts must be greater than zero.", exception.getMessage());
        }

        @Test
        void throwsWhenInvoiceIdMissing() {
                BigDecimal target = new BigDecimal("10");
                List<InvoiceInput> invoices = List.of(new InvoiceInput(" ", new BigDecimal("10")));

                IllegalArgumentException exception = assertThrows(
                        IllegalArgumentException.class,
                        () -> combinationService.findCombinations(target, invoices, CombinationFilters.empty())
                );

                assertEquals("Invoice id is required.", exception.getMessage());
        }

        @Test
        void worksWithDecimalAmounts() {
                BigDecimal target = new BigDecimal("10.50");
                List<InvoiceInput> invoices = List.of(
                        invoice("INV-10", "4.00"),
                        invoice("INV-11", "5.25"),
                        invoice("INV-12", "5.25"),
                        invoice("INV-13", "6.50")
                );

                CombinationResult result = combinationService.findCombinations(target, invoices, CombinationFilters.empty());
                List<List<String>> combinations = result.combinations();

                assertEquals(2, combinations.size());
                assertEquals(List.of("INV-10", "INV-13"), combinations.get(0));
                assertEquals(List.of("INV-11", "INV-12"), combinations.get(1));
        }

        @Test
        void respectsMinAndMaxInvoiceFilters() {
                BigDecimal target = new BigDecimal("15");
                List<InvoiceInput> invoices = List.of(
                        invoice("INV-100", "5"),
                        invoice("INV-200", "5"),
                        invoice("INV-300", "5"),
                        invoice("INV-400", "10")
                );

                CombinationFilters filters = new CombinationFilters(2, 2, java.util.Set.of());

                CombinationResult result = combinationService.findCombinations(target, invoices, filters);

                assertEquals(List.of(List.of("INV-100", "INV-400"), List.of("INV-200", "INV-400"), List.of("INV-300", "INV-400")),
                        result.combinations());
        }

        @Test
        void respectsRequiredInvoiceIds() {
                BigDecimal target = new BigDecimal("15");
                List<InvoiceInput> invoices = List.of(
                        invoice("INV-A", "5"),
                        invoice("INV-B", "6"),
                        invoice("INV-C", "9"),
                        invoice("INV-D", "10")
                );

                CombinationFilters filters = new CombinationFilters(null, null, java.util.Set.of("INV-A"));

                CombinationResult result = combinationService.findCombinations(target, invoices, filters);

                assertEquals(List.of(List.of("INV-A", "INV-D")), result.combinations());
        }

        @Test
        void throwsWhenRequiredInvoiceMissing() {
                BigDecimal target = new BigDecimal("15");
                List<InvoiceInput> invoices = List.of(invoice("INV-1", "15"));

                CombinationFilters filters = new CombinationFilters(null, null, java.util.Set.of("INV-unknown"));

                IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                        () -> combinationService.findCombinations(target, invoices, filters));

                assertEquals("One or more required invoice ids are not present in the invoice list.", exception.getMessage());
        }

        private InvoiceInput invoice(String id, String amount) {
                return new InvoiceInput(id, new BigDecimal(amount));
        }
}
