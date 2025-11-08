package com.zrpires.Docs.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cards")
@Getter
@Setter
public class CardModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;

    @OneToMany(mappedBy = "card", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FileModel> files = new ArrayList<>();

    public void addFile(FileModel file){
        this.files.add(file);
        file.setCard(this);
    }

    public void removeFile(FileModel file){
        this.files.remove(file);
        file.setCard(null);
    }


}
