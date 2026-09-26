package com.military.transaction.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@Service
public class AssetServiceClient {

    private static final Logger log = LoggerFactory.getLogger(AssetServiceClient.class);

    private final RestTemplate restTemplate;

    @Value("${asset-service.url:http://localhost:8082}")
    private String assetServiceUrl;

    public AssetServiceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public int getAvailableQuantity(Long baseId, Long equipmentId) {
        try {
            String url = assetServiceUrl + "/api/inventory/" + baseId + "/" + equipmentId;
            Map response = restTemplate.getForObject(url, Map.class);
            if (response != null && response.containsKey("quantity")) {
                return ((Number) response.get("quantity")).intValue();
            }
        } catch (Exception e) {
            log.warn("Failed to check inventory via REST call to Asset Service: {}", e.getMessage());
        }
        // Fallback: Return max value if Asset Service is unreachable or async event processing is used
        return Integer.MAX_VALUE;
    }

    public void validateSufficientStock(Long baseId, Long equipmentId, int requiredQuantity) {
        int available = getAvailableQuantity(baseId, equipmentId);
        if (available < requiredQuantity && available != Integer.MAX_VALUE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "INSUFFICIENT_INVENTORY: Base " + baseId + " has only " + available + " units available.");
        }
    }
}
