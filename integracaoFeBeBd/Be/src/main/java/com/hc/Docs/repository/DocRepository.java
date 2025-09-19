package com.hc.Docs.repository;

import com.hc.Docs.model.DocModel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocRepository extends JpaRepository<DocModel, Long> {
}
