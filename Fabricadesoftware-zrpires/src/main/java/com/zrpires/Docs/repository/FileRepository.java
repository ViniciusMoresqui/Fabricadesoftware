package com.zrpires.Docs.repository;

import com.zrpires.Docs.model.FileModel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FileRepository extends JpaRepository<FileModel, Long> {
}
