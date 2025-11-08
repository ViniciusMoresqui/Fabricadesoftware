package com.zrpires.Docs.repository;

import com.zrpires.Docs.model.CardModel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CardRepository extends JpaRepository<CardModel, Long> {
}
