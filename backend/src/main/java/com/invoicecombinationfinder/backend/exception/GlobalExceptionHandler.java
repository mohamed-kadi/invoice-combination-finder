package com.invoicecombinationfinder.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<Map<String, Object>> handleValidationException(MethodArgumentNotValidException exception) {
                Map<String, Object> body = new HashMap<>();
                body.put("message", "Validation failed");
                Map<String, List<String>> errors = exception.getBindingResult()
                        .getFieldErrors()
                        .stream()
                        .collect(Collectors.groupingBy(
                                FieldError::getField,
                                LinkedHashMap::new,
                                Collectors.mapping(FieldError::getDefaultMessage, Collectors.toList())
                        ));
                body.put("errors", errors);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
        }

        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException exception) {
                Map<String, Object> body = new HashMap<>();
                body.put("message", exception.getMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
        }
}
