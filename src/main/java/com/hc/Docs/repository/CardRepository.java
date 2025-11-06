package com.hc.Docs.repository;

import com.hc.Docs.model.CardModel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CardRepository extends JpaRepository<CardModel, Long> {
}
