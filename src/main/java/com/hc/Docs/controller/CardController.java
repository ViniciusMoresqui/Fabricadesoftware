package com.hc.Docs.controller;

import com.hc.Docs.model.CardModel;
import com.hc.Docs.service.CardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/docs")
@CrossOrigin("*")
public class CardController {
    @Autowired
    private CardService service;

    @GetMapping
    public ResponseEntity<List<CardModel>> findAll(){
        List<CardModel> response = this.service.findAll();
        if (!response.isEmpty()){
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CardModel> findById(@PathVariable Long id){
        return this.service.findById(id)
                .map(docModel -> new ResponseEntity<>(docModel, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<CardModel> save(@RequestBody CardModel doc){
        CardModel response = this.service.save(doc);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CardModel> update(@PathVariable("id") Long id, @RequestBody CardModel doc){
        return this.service.update(id, doc)
                .map(self -> new ResponseEntity<>(self, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<CardModel> delete(@PathVariable("id") Long id){
        return this.service.delete(id)
                .map(self -> new ResponseEntity<>(self, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }


}
