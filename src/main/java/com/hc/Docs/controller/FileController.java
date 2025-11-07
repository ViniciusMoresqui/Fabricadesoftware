package com.hc.Docs.controller;


import com.hc.Docs.model.FileModel;
import com.hc.Docs.service.CardService;
import com.hc.Docs.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/file")
public class FileController {

    @Autowired
    FileService fileService;

    @PostMapping("/{id}")
    public ResponseEntity<FileModel> uploadFile(@PathVariable("id") Long idCard, @RequestParam("file") MultipartFile file){
        System.out.println(idCard);
        FileModel response = fileService.saveFile(idCard, file);
        if (response != null){
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().build();
    }


}
