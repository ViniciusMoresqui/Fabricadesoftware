package com.hc.Docs.service;

import com.hc.Docs.configuration.FileConfiguration;
import com.hc.Docs.model.CardModel;
import com.hc.Docs.model.FileModel;
import com.hc.Docs.repository.CardRepository;
import com.hc.Docs.repository.FileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;
import java.util.UUID;

@Service
public class FileService {

    @Autowired
    private CardRepository cardRepository;
    @Autowired
    private FileRepository fileRepository;
    @Autowired
    private FileConfiguration fileConfiguration;

    public FileModel getFileModel(Long id){
        return this.fileRepository.findById(id).orElse(null);
    }

    public CardModel saveFile(Long idCard, MultipartFile file){
        if (!cardRepository.existsById(idCard)){
            return null;
        }
        CardModel card = cardRepository.findById(idCard).get();

        String originalName = file.getOriginalFilename();
        String ext = originalName.substring(originalName.lastIndexOf("."));
        String localName = UUID.randomUUID() + ext;

        Path path = Paths.get(fileConfiguration.getName())
                .resolve(localName);
        try{
            file.transferTo(path);
        }catch (IOException er){
            return null;
        }

        FileModel fileReference = new FileModel(originalName, ext, localName);
        card.addFile(fileReference);
        return cardRepository.save(card);
    }

    public Resource getFile(Long fileId){
        FileModel fileReference = fileRepository.findById(fileId).orElseThrow();

        Path path = Paths.get(fileConfiguration.getName())
                .resolve(fileReference.getLocalName());

        try {
             Resource resource = new UrlResource(path.toUri());
             if (!resource.exists() || !resource.isReadable()){
                 return null;
             }
             return resource;
        }catch (MalformedURLException er){
            return null;
        }

    }

    public boolean deleteFile(Long idFile){
        Optional<FileModel> fileOpt = this.fileRepository.findById(idFile);

        if(fileOpt.isEmpty()){
            return false;
        }

        FileModel file = fileOpt.get();

        Path path = Paths.get(fileConfiguration.getName()).resolve(file.getLocalName());

        try{
            Files.deleteIfExists(path);
            CardModel card = file.getCard();
            if (card!=null){
                card.removeFile(file);
                cardRepository.save(card);
            }
            fileRepository.delete(file);
            return true;
        }catch (IOException er){
            return false;
        }

    }
}
