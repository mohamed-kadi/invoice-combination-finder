package com.invoicecombinationfinder.backend.service;

import com.invoicecombinationfinder.backend.dto.InvoiceInput;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ExcelInvoiceParserTest {

        private final ExcelInvoiceParser parser = new ExcelInvoiceParser();

        @Test
        void parsesValidExcelFile() throws IOException {
                MockMultipartFile file = createWorkbookFile(new String[][]{
                        {"Invoice ID", "Amount"},
                        {"INV-1", "15.50"},
                        {"INV-2", "20"}
                });

                List<InvoiceInput> invoices = parser.parse(file);

                assertEquals(2, invoices.size());
                assertEquals("INV-1", invoices.get(0).id());
                assertEquals(new BigDecimal("15.50"), invoices.get(0).amount());
        }

        @Test
        void rejectsMissingData() throws IOException {
                MockMultipartFile file = createWorkbookFile(new String[][]{
                        {"Invoice ID", "Amount"},
                        {"INV-1", ""}
                });

                IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> parser.parse(file));

                assertEquals("Each data row must contain both an invoice id and amount.", exception.getMessage());
        }

        private MockMultipartFile createWorkbookFile(String[][] rows) throws IOException {
                try (var workbook = new XSSFWorkbook();
                     var outputStream = new ByteArrayOutputStream()) {
                        var sheet = workbook.createSheet("Invoices");
                        for (int i = 0; i < rows.length; i++) {
                                var row = sheet.createRow(i);
                                for (int j = 0; j < rows[i].length; j++) {
                                        row.createCell(j).setCellValue(rows[i][j]);
                                }
                        }
                        workbook.write(outputStream);
                        return new MockMultipartFile(
                                "file",
                                "invoices.xlsx",
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                                outputStream.toByteArray()
                        );
                }
        }
}
