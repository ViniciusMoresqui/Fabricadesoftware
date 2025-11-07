package com.hc.Docs.service;

import com.hc.Docs.configuration.FileConfiguration;
import com.hc.Docs.model.CardModel;
import com.hc.Docs.model.FileModel;
import com.hc.Docs.repository.CardRepository;
import com.hc.Docs.repository.FileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileService {

    @Autowired
    private CardRepository cardRepository;
    @Autowired
    private FileRepository fileRepository;
    @Autowired
    private FileConfiguration fileConfiguration;

    public FileModel saveFile(Long idCard, MultipartFile file){
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
        cardRepository.save(card);
        return fileReference;
    }


}
