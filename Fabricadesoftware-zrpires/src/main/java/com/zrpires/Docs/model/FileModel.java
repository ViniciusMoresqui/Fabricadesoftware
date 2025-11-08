package com.zrpires.Docs.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "files")
@Getter
@Setter
@NoArgsConstructor
public class FileModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String originalFileName;
    private String ext;
    private String localName;

    @ManyToOne
    @JoinColumn(name = "card_id")
    @JsonIgnore
    private CardModel card;

    public FileModel(String originalFileName, String ext, String localName) {
        this.originalFileName = originalFileName;
        this.ext = ext;
        this.localName = localName;
    }
}
