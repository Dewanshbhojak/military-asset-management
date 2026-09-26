package com.military.asset.service;

import com.military.asset.entity.Base;
import com.military.asset.repository.BaseRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class BaseService {

    private final BaseRepository baseRepository;

    public BaseService(BaseRepository baseRepository) {
        this.baseRepository = baseRepository;
    }

    public List<Base> getAllBases() {
        return baseRepository.findAll();
    }

    public Base getBaseById(Long id) {
        return baseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Base not found with ID: " + id));
    }

    public Base createBase(Base base) {
        return baseRepository.save(base);
    }

    public Base updateBase(Long id, Base updatedBase) {
        Base existing = getBaseById(id);
        existing.setName(updatedBase.getName());
        existing.setLocation(updatedBase.getLocation());
        return baseRepository.save(existing);
    }

    public void deleteBase(Long id) {
        Base existing = getBaseById(id);
        baseRepository.delete(existing);
    }
}
