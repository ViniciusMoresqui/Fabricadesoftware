package com.hc.Docs.controller;

import com.hc.Docs.model.DocModel;
import com.hc.Docs.service.DocService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.print.Doc;
import java.util.List;

@RestController
@RequestMapping("/docs")
public class DocController {
    @Autowired
    private DocService service;

    @GetMapping
    public ResponseEntity<List<DocModel>> findAll(){
        return this.service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocModel> findById(@PathVariable Long id){
        return service.findById(id);
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
