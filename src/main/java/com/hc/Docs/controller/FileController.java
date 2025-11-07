package com.hc.Docs.controller;


import com.hc.Docs.model.CardModel;
import com.hc.Docs.model.FileModel;
import com.hc.Docs.service.CardService;
import com.hc.Docs.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/file")
//@CrossOrigin("*")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "*"})
public class FileController {

    @Autowired
    FileService fileService;

    @PostMapping("/{id}")
    public ResponseEntity<CardModel> uploadFile(@PathVariable("id") Long idCard, @RequestParam("file") MultipartFile file){
        CardModel response = fileService.saveFile(idCard, file);
        if (response != null){
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable("id")Long idFile){
        FileModel fileModel = fileService.getFileModel(idFile);
        if (fileModel==null) return ResponseEntity.notFound().build();
        Resource fileResponse = this.fileService.getFile(idFile);
        if (fileResponse==null) return ResponseEntity.badRequest().build();

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + fileModel.getOriginalFileName() + "\"")
                .body(fileResponse);

    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFile(@PathVariable("id") Long id){
        if (this.fileService.deleteFile(id)){
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
