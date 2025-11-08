package com.zrpires.Docs.service;

import com.zrpires.Docs.model.CardModel;
import com.zrpires.Docs.model.FileModel;
import com.zrpires.Docs.repository.CardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CardService {

    @Autowired
    private CardRepository repo;

    @Autowired
    private FileService fileService;

    public List<CardModel> findAll(){
        return this.repo.findAll();
    }

    public Optional<CardModel> findById(Long id){
        return this.repo.findById(id);
    }

    public CardModel save(CardModel doc){
        return this.repo.save(doc);
    }

    public Optional<CardModel> update(Long id, CardModel newCard){
        return repo.findById(id).map(self -> {
            self.setTitle(newCard.getTitle());
            return this.repo.save(self);
        });
    }

    public Optional<CardModel> delete(Long id){
        if (!this.repo.existsById(id)) return Optional.empty();

        CardModel card = repo.findById(id).get();
        List<FileModel> files = card.getFiles();
        this.fileService.removeFileListFromStorage(files);

//        System.out.println("Itens na lista"+files.size());
//
//        for (FileModel file : files) {
//            fileService.deleteFile(file.getId());
//        }

//        for (FileModel f: files){
//            fileService.deleteFile(f.getId());
//        }


        this.repo.deleteById(id);
        return Optional.of(card);
    }

    public boolean existById(Long id){
        return this.repo.existsById(id);
    }
}
