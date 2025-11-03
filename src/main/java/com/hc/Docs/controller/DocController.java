package com.hc.Docs.controller;

import com.hc.Docs.model.DocModel;
import com.hc.Docs.service.DocService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.print.Doc;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/docs")
@CrossOrigin("*")
public class DocController {
    @Autowired
    private DocService service;

    @GetMapping
    public ResponseEntity<List<DocModel>> findAll(){
        List<DocModel> response = this.service.findAll();
        if (!response.isEmpty()){
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocModel> findById(@PathVariable Long id){
        return this.service.findById(id)
                .map(docModel -> new ResponseEntity<>(docModel, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));

//        if (response.isPresent()){
//            return new ResponseEntity<>(response.get(), HttpStatus.OK);
//        }
//        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping
    public ResponseEntity<DocModel> save(@RequestBody DocModel doc){
        return this.service.save(doc);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DocModel> update(@PathVariable("id") Long id,@RequestBody DocModel doc){
        return this.service.update(id, doc);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<DocModel> delete(@PathVariable("id") Long id){
        return this.service.delete(id);
    }


}
