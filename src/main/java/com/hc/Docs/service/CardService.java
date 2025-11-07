package com.hc.Docs.service;

import com.hc.Docs.model.CardModel;
import com.hc.Docs.repository.CardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CardService {

    @Autowired
    private CardRepository repo;

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
        return this.repo.findById(id)
                .map(self -> {
                    this.repo.deleteById(id);
                    return self;
                });
    }

    public boolean existById(Long id){
        return this.repo.existsById(id);
    }
}
