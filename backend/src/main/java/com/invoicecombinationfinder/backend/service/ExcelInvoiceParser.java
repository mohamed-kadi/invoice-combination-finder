package com.invoicecombinationfinder.backend.service;

import com.invoicecombinationfinder.backend.dto.InvoiceInput;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
public class ExcelInvoiceParser {

        private static final String XLSX_EXTENSION = ".xlsx";

        public List<InvoiceInput> parse(MultipartFile file) {
                if (file == null || file.isEmpty()) {
                        throw new IllegalArgumentException("Uploaded file is empty.");
                }
                String filename = file.getOriginalFilename();
                if (filename == null || !filename.toLowerCase().endsWith(XLSX_EXTENSION)) {
                        throw new IllegalArgumentException("Only .xlsx Excel files are supported.");
                }

                try (InputStream inputStream = file.getInputStream();
                     var workbook = WorkbookFactory.create(inputStream)) {
                        Sheet sheet = workbook.getNumberOfSheets() > 0 ? workbook.getSheetAt(0) : null;
                        if (sheet == null) {
                                throw new IllegalArgumentException("The Excel file does not contain any sheets.");
                        }

                        DataFormatter formatter = new DataFormatter();
                        List<InvoiceInput> invoices = new ArrayList<>();
                        boolean headerSkipped = false;

                        for (Row row : sheet) {
                                if (isRowEmpty(row)) {
                                        continue;
                                }

                                String firstCellValue = formatter.formatCellValue(row.getCell(0)).trim();
                                String secondCellValue = formatter.formatCellValue(row.getCell(1)).trim();

                                if (!headerSkipped && looksLikeHeader(firstCellValue, secondCellValue)) {
                                        headerSkipped = true;
                                        continue;
                                }

                                if (firstCellValue.isEmpty() || secondCellValue.isEmpty()) {
                                        throw new IllegalArgumentException("Each data row must contain both an invoice id and amount.");
                                }

                                BigDecimal amount = parseAmount(secondCellValue, row.getRowNum() + 1);
                                invoices.add(new InvoiceInput(firstCellValue, amount));
                        }

                        if (invoices.isEmpty()) {
                                throw new IllegalArgumentException("No invoice rows were detected in the Excel sheet.");
                        }

                        return invoices;
                } catch (IllegalArgumentException exception) {
                        throw exception;
                } catch (IOException exception) {
                        throw new IllegalArgumentException("Unable to read the uploaded Excel file.", exception);
                }
        }

        private boolean looksLikeHeader(String firstCell, String secondCell) {
                String first = firstCell.toLowerCase();
                String second = secondCell.toLowerCase();
                return ("id".equals(first) || first.contains("invoice"))
                        && (second.contains("amount") || "amount".equals(second));
        }

        private boolean isRowEmpty(Row row) {
                if (row == null) {
                        return true;
                }
                return row.getFirstCellNum() == -1;
        }

        private BigDecimal parseAmount(String value, int rowNumber) {
                try {
                        return new BigDecimal(value);
                } catch (NumberFormatException exception) {
                        throw new IllegalArgumentException("Invalid amount at row " + rowNumber + ": " + value);
                }
        }
}
