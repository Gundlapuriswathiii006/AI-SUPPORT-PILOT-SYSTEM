package com.supportpilot.repository;

import com.supportpilot.model.KbArticle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KbArticleRepository extends JpaRepository<KbArticle, String> {
    List<KbArticle> findByCategory(String category);
    List<KbArticle> findByTitleContainingIgnoreCase(String keyword);
}
