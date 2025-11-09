package com.invoicecombinationfinder.backend.controller;

import com.invoicecombinationfinder.backend.dto.InvoiceInput;
import com.invoicecombinationfinder.backend.service.CombinationResult;
import com.invoicecombinationfinder.backend.service.CombinationService;
import com.invoicecombinationfinder.backend.service.ExcelInvoiceParser;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = CombinationController.class)
class CombinationControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @MockBean
        private CombinationService combinationService;

        @MockBean
        private ExcelInvoiceParser excelInvoiceParser;

        @Test
        void returnsCombinationsFromService() throws Exception {
                List<List<String>> combinations = List.of(List.of("INV-1", "INV-2"));
                Map<String, InvoiceInput> invoiceMap = new LinkedHashMap<>();
                invoiceMap.put("INV-1", new InvoiceInput("INV-1", new BigDecimal("5")));
                invoiceMap.put("INV-2", new InvoiceInput("INV-2", new BigDecimal("10")));

                Mockito.when(combinationService.findCombinations(eq(new BigDecimal("15")), any(), any()))
                        .thenReturn(new CombinationResult(combinations, invoiceMap));

                String requestBody = """
                        {
                          "target": 15,
                          "minInvoices": 1,
                          "maxInvoices": 2,
                          "requiredInvoiceIds": ["INV-1"],
                          "invoices": [
                            {"id": "INV-1", "amount": 5},
                            {"id": "INV-2", "amount": 10},
                            {"id": "INV-3", "amount": 12}
                          ]
                        }
                        """;

                mockMvc.perform(post("/api/combinations")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.combinationCount").value(1))
                        .andExpect(jsonPath("$.combinations[0][0]").value("INV-1"))
                        .andExpect(jsonPath("$.combinations[0][1]").value("INV-2"))
                        .andExpect(jsonPath("$.invoiceAmounts.INV-1").value(5))
                        .andExpect(jsonPath("$.invoiceAmounts.INV-2").value(10));

                Mockito.verify(combinationService).findCombinations(eq(new BigDecimal("15")), any(), org.mockito.ArgumentMatchers.argThat(filters ->
                        filters != null
                                && filters.minInvoices() != null && filters.minInvoices() == 1
                                && filters.maxInvoices() != null && filters.maxInvoices() == 2
                                && filters.requiredInvoiceIds().contains("INV-1")));
        }

        @Test
        void propagatesValidationErrors() throws Exception {
                String requestBody = """
                        {
                          "target": 0,
                          "invoices": []
                        }
                        """;

                mockMvc.perform(post("/api/combinations")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody))
                        .andExpect(status().isBadRequest())
                        .andExpect(jsonPath("$.message").value("Validation failed"));
        }

        @Test
        void returnsCombinationsFromExcelUpload() throws Exception {
                MockMultipartFile file = new MockMultipartFile(
                        "file",
                        "invoices.xlsx",
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        "dummy".getBytes()
                );

                List<InvoiceInput> parsedInvoices = List.of(
                        new InvoiceInput("INV-1", new BigDecimal("5")),
                        new InvoiceInput("INV-2", new BigDecimal("10"))
                );
                List<List<String>> combinations = List.of(List.of("INV-1", "INV-2"));
                Map<String, InvoiceInput> invoiceMap = new LinkedHashMap<>();
                parsedInvoices.forEach(invoice -> invoiceMap.put(invoice.id(), invoice));

                Mockito.when(excelInvoiceParser.parse(any())).thenReturn(parsedInvoices);
                Mockito.when(combinationService.findCombinations(eq(new BigDecimal("15")), any(), any()))
                        .thenReturn(new CombinationResult(combinations, invoiceMap));

                mockMvc.perform(MockMvcRequestBuilders.multipart("/api/combinations/upload")
                                .file(file)
                                .param("target", "15")
                                .param("minInvoices", "1")
                                .param("maxInvoices", "3")
                                .param("requiredIds", "INV-1"))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.combinationCount").value(1))
                        .andExpect(jsonPath("$.combinations[0][0]").value("INV-1"))
                        .andExpect(jsonPath("$.invoiceAmounts.INV-2").value(10));

                Mockito.verify(combinationService).findCombinations(eq(new BigDecimal("15")), any(), org.mockito.ArgumentMatchers.argThat(filters ->
                        filters != null
                                && filters.minInvoices() != null && filters.minInvoices() == 1
                                && filters.maxInvoices() != null && filters.maxInvoices() == 3
                                && filters.requiredInvoiceIds().contains("INV-1")));
        }

        @Test
        void exportsCsvWithCombinations() throws Exception {
                List<List<String>> combinations = List.of(List.of("INV-1", "INV-2"));
                Map<String, InvoiceInput> invoiceMap = new LinkedHashMap<>();
                invoiceMap.put("INV-1", new InvoiceInput("INV-1", new BigDecimal("5")));
                invoiceMap.put("INV-2", new InvoiceInput("INV-2", new BigDecimal("10")));

                Mockito.when(combinationService.findCombinations(eq(new BigDecimal("15")), any(), any()))
                        .thenReturn(new CombinationResult(combinations, invoiceMap));

                String requestBody = """
                        {
                          "target": 15,
                          "invoices": [
                            {"id": "INV-1", "amount": 5},
                            {"id": "INV-2", "amount": 10},
                            {"id": "INV-3", "amount": 12}
                          ]
                        }
                        """;

                mockMvc.perform(post("/api/combinations/export")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody))
                        .andExpect(status().isOk())
                        .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().string(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=invoice-mix-combinations.csv"))
                        .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.content().string(org.hamcrest.Matchers.containsString("INV-1 (5)")));
        }
}
