package com.hc.Docs.service;

import com.hc.Docs.model.DocModel;
import com.hc.Docs.repository.DocRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DocService {

    @Autowired
    private DocRepository repo;

    public ResponseEntity<List<DocModel>> findAll(){
        List<DocModel> response = this.repo.findAll();
        if (!response.isEmpty()){
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    public ResponseEntity<DocModel> findById(Long id){
        return this.repo.findById(id)
                .map(self -> new ResponseEntity<>(self, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    public ResponseEntity<DocModel> save(DocModel doc){
        DocModel saved = this.repo.save(doc);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    public ResponseEntity<DocModel> update(Long id, DocModel newDoc){
        return repo.findById(id).map(self -> {
            self.setTitle(newDoc.getTitle());
            self.setContent(newDoc.getContent());
            DocModel response = this.repo.save(self);
            return new ResponseEntity<>(response, HttpStatus.OK);
        }).orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    public ResponseEntity<DocModel> delete(Long id){
        return this.repo.findById(id)
                .map(self -> {
                    this.repo.deleteById(id);
                    return new ResponseEntity<>(self, HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
}
