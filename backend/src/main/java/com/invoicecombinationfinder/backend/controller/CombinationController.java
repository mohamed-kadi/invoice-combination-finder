package com.invoicecombinationfinder.backend.controller;

import com.invoicecombinationfinder.backend.dto.CombinationRequest;
import com.invoicecombinationfinder.backend.dto.CombinationResponse;
import com.invoicecombinationfinder.backend.service.CombinationFilters;
import com.invoicecombinationfinder.backend.service.CombinationResult;
import com.invoicecombinationfinder.backend.service.CombinationService;
import com.invoicecombinationfinder.backend.service.ExcelInvoiceParser;
import jakarta.validation.Valid;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/combinations")
public class CombinationController {

        private final CombinationService combinationService;
        private final ExcelInvoiceParser excelInvoiceParser;

        public CombinationController(CombinationService combinationService, ExcelInvoiceParser excelInvoiceParser) {
                this.combinationService = combinationService;
                this.excelInvoiceParser = excelInvoiceParser;
        }

        @PostMapping
        public CombinationResponse findInvoiceCombinations(@Valid @RequestBody CombinationRequest request) {
                CombinationFilters filters = buildFilters(request.minInvoices(), request.maxInvoices(), request.requiredInvoiceIds());
                CombinationResult result = combinationService.findCombinations(request.target(), request.invoices(), filters);
                return buildResponse(result);
        }

        @PostMapping(path = "/upload", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
        public CombinationResponse findInvoiceCombinationsFromExcel(@RequestParam("target") BigDecimal target,
                                                                    @RequestParam("file") MultipartFile file,
                                                                    @RequestParam(value = "minInvoices", required = false) Integer minInvoices,
                                                                    @RequestParam(value = "maxInvoices", required = false) Integer maxInvoices,
                                                                    @RequestParam(value = "requiredIds", required = false) List<String> requiredIds) {
                List<com.invoicecombinationfinder.backend.dto.InvoiceInput> invoices = excelInvoiceParser.parse(file);
                CombinationFilters filters = buildFilters(minInvoices, maxInvoices, requiredIds);
                CombinationResult result = combinationService.findCombinations(target, invoices, filters);
                return buildResponse(result);
        }

        @PostMapping(value = "/export", produces = "text/csv")
        public ResponseEntity<ByteArrayResource> exportInvoiceCombinations(@Valid @RequestBody CombinationRequest request) {
                CombinationFilters filters = buildFilters(request.minInvoices(), request.maxInvoices(), request.requiredInvoiceIds());
                CombinationResult result = combinationService.findCombinations(request.target(), request.invoices(), filters);

                StringBuilder builder = new StringBuilder();
                builder.append("Combination,Invoice IDs,Total Amount\n");

                Map<String, com.invoicecombinationfinder.backend.dto.InvoiceInput> invoiceById = result.invoiceById();

                for (int index = 0; index < result.combinations().size(); index++) {
                        List<String> combination = result.combinations().get(index);
                        String invoiceDetails = combination.stream()
                                .map(id -> {
                                        com.invoicecombinationfinder.backend.dto.InvoiceInput invoice = invoiceById.get(id);
                                        String amount = invoice != null ? invoice.amount().toPlainString() : "";
                                        return id + " (" + amount + ")";
                                })
                                .collect(Collectors.joining("; "));
                        BigDecimal total = combination.stream()
                                .map(invoiceById::get)
                                .filter(java.util.Objects::nonNull)
                                .map(com.invoicecombinationfinder.backend.dto.InvoiceInput::amount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
                        builder.append(index + 1)
                                .append(',')
                                .append('"').append(invoiceDetails.replace("\"", "\"\"")).append('"')
                                .append(',')
                                .append(total.toPlainString())
                                .append('\n');
                }

                byte[] csvBytes = builder.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
                ByteArrayResource resource = new ByteArrayResource(csvBytes);

                return ResponseEntity.ok()
                        .contentType(MediaType.TEXT_PLAIN)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=invoice-mix-combinations.csv")
                        .contentLength(csvBytes.length)
                        .body(resource);
        }

        private CombinationResponse buildResponse(CombinationResult result) {
                Map<String, BigDecimal> invoiceAmounts = result.invoiceById().entrySet().stream()
                        .collect(Collectors.toMap(
                                Map.Entry::getKey,
                                entry -> entry.getValue().amount(),
                                (first, second) -> first,
                                java.util.LinkedHashMap::new
                        ));
                return new CombinationResponse(result.combinations(), invoiceAmounts);
        }

        private CombinationFilters buildFilters(Integer minInvoices,
                                                Integer maxInvoices,
                                                List<String> requiredIds) {
                java.util.Set<String> sanitizedIds = requiredIds == null ? null : requiredIds.stream()
                        .filter(value -> value != null && !value.trim().isEmpty())
                        .map(String::trim)
                        .collect(java.util.stream.Collectors.toCollection(java.util.LinkedHashSet::new));
                return new CombinationFilters(minInvoices, maxInvoices, sanitizedIds);
        }
}
